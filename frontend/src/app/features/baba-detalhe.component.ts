import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { AvaliacaoPublica, Baba, Confianca } from '../core/models';
import { iniciais, msgErro } from '../core/util';

@Component({
  selector: 'app-baba-detalhe',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, DatePipe, FormsModule, RouterLink],
  template: `
    <section class="container pagina">
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }
      @if (aviso()) { <div class="aviso ok" role="status">{{ aviso() }}</div> }

      @if (baba(); as b) {
        <div class="cabeca-perfil">
          <div [class]="'foto grande cor-' + (b.id % 4)" aria-hidden="true">{{ ini() }}</div>
          <div>
            <h1 style="margin-bottom:.2em">{{ b.nome }}</h1>
            <p class="muted" style="margin:0">{{ b.cidade }}, {{ b.estado }}</p>
            <div class="chips" style="margin-top:.6rem">
              @if (b.verificada) { <span class="selo">Perfil verificado</span> } @else { <span class="chip">Verificação em análise</span> }
              <span class="chip">Nota {{ b.notaMedia | number: '1.1-1' }}</span>
              <span class="chip">{{ b.experienciaAnos || 0 }} anos de experiência</span>
            </div>
          </div>
          @if (auth.logado()) {
            <button type="button" class="fav" [attr.aria-pressed]="favorito()" aria-label="Favoritar" (click)="alternarFavorito()">{{ favorito() ? '♥' : '♡' }}</button>
          }
        </div>

        <div class="perfil-grid">
          <div>
            <h2>Sobre</h2>
            <p>{{ b.descricao || 'Profissional disponível para cuidar com carinho e responsabilidade.' }}</p>
            <dl style="display:grid;grid-template-columns:auto 1fr;gap:.4rem 1.2rem">
              <dt><strong>Valor</strong></dt><dd style="margin:0">{{ b.valorHora | currency: 'BRL' }} por hora</dd>
              <dt><strong>Disponibilidade</strong></dt><dd style="margin:0">{{ b.disponibilidade || 'Não informada' }}</dd>
            </dl>

            @if (conf(); as c) {
              <h2 style="margin-top:2rem">Índice de Confiança</h2>
              <div class="caixa" style="display:grid;gap:.8rem">
                <div style="display:flex;align-items:center;gap:1rem">
                  <div class="anel" [style.--p]="c.score" role="img" [attr.aria-label]="'Índice de confiança ' + c.score + ' de 100'">
                    <div class="disco"><b>{{ c.score }}</b></div>
                  </div>
                  <div><strong>Nível: {{ c.nivel }}</strong></div>
                </div>
                <div class="selos">@for (s of c.selos; track s) { <span class="chip">{{ s }}</span> }</div>
                @for (i of c.itens; track i.nome) {
                  <div class="conf-linha"><span>{{ i.nome }}</span><b>{{ i.pontos }}/{{ i.max }}</b></div>
                }
              </div>
            }

            <h2 style="margin-top:2rem">Consultar disponibilidade</h2>
            <p class="muted">Veja os períodos de atendimento livres nos próximos 30 dias. Compromissos e folgas aparecem apenas como indisponíveis.</p>
            @if (carregandoAgenda()) { <p class="muted">Consultando agenda…</p> }
            @if (agendaErro()) { <div class="aviso erro">{{ agendaErro() }}</div> }
            @if (!carregandoAgenda() && agendaDias().length === 0 && !agendaErro()) { <p class="muted">Esta profissional ainda não cadastrou horários semanais.</p> }
            @for (dia of agendaDias(); track dia.data) {
              <article class="avaliacao" style="display:grid;gap:.45rem">
                <strong>{{ dia.rotulo }}</strong>
                @if (dia.faixas.length) {
                  <div class="chips">@for (faixa of dia.faixas; track faixa) { <span class="chip">{{ faixa }}</span> }</div>
                  <a class="btn pequeno sol" [routerLink]="['/agendar', b.id]" [queryParams]="{data:dia.data,inicio:dia.faixas[0].split('–')[0],fim:dia.faixas[0].split('–')[1]}">Agendar neste dia</a>
                } @else { <span class="muted">Sem horários disponíveis</span> }
              </article>
            }

            <h2 style="margin-top:2rem">Avaliações</h2>
            @if (avaliacoes().length === 0) { <p class="muted">Ainda não há avaliações.</p> }
            @for (a of avaliacoes(); track a.id) {
              <article class="avaliacao">
                <strong>Nota {{ a.nota }} de 5</strong>
                <span class="muted"> em {{ a.criadoEm | date: 'dd/MM/yyyy' }}</span>
                @if (a.comentario) { <p>{{ a.comentario }}</p> }
              </article>
            }
          </div>

          <aside class="caixa">
            @if (auth.tipo() === 'PAI') {
              <h2>Contratar</h2>
              <p>Escolha data e horário. A babá aceita ou recusa, e você acompanha o atendimento ao vivo.</p>
              <a class="btn sol" [routerLink]="['/agendar', b.id]">Agendar</a>
              <a class="btn vazio" [routerLink]="['/chat', b.id]">Conversar</a>
            } @else if (!auth.logado()) {
              <h2>Quer contratar?</h2>
              <p>Entre com uma conta de responsável para agendar.</p>
              <a class="btn" routerLink="/login">Entrar</a>
            } @else {
              <h2>Perfil público</h2>
              <p class="muted">Somente contas de responsável podem agendar.</p>
            }

            @if (auth.logado()) {
              <details style="margin-top:1.5rem">
                <summary style="cursor:pointer;font-weight:700">Denunciar este perfil</summary>
                <div class="campo" style="margin-top:.8rem">
                  <label for="motivo">Motivo</label>
                  <select id="motivo" [(ngModel)]="motivo">
                    <option>Informações falsas</option>
                    <option>Comportamento inadequado</option>
                    <option>Suspeita de golpe</option>
                    <option>Outro motivo</option>
                  </select>
                </div>
                <div class="campo">
                  <label for="desc">Detalhes</label>
                  <textarea id="desc" [(ngModel)]="detalhes" maxlength="900"></textarea>
                </div>
                <button type="button" class="btn pequeno vazio" (click)="denunciar(b)">Enviar denúncia</button>
              </details>
            }
          </aside>
        </div>
      } @else if (!erro()) {
        <div class="esqueleto"></div>
      }
    </section>
  `,
})
export class BabaDetalheComponent {
  private api = inject(ApiService);
  auth = inject(AuthService);

  id = input.required<string>(); // parâmetro da rota
  baba = signal<Baba | null>(null);
  conf = signal<Confianca | null>(null);
  avaliacoes = signal<AvaliacaoPublica[]>([]);
  favorito = signal(false);
  erro = signal('');
  aviso = signal('');
  motivo = 'Informações falsas';
  detalhes = '';
  carregandoAgenda = signal(false);
  agendaErro = signal('');
  agendaDias = signal<Array<{data:string;rotulo:string;faixas:string[]}>>([]);

  ini = computed(() => iniciais(this.baba()?.nome ?? ''));

  constructor() {
    effect(() => {
      const id = Number(this.id());
      this.api.baba(id).subscribe({ next: (b) => this.baba.set(b), error: (e) => this.erro.set(msgErro(e)) });
      this.carregarAgenda(id);
      this.api.confianca(id).subscribe({ next: (c) => this.conf.set(c), error: () => this.conf.set(null) });
      this.api.avaliacoesDaBaba(id).subscribe({ next: (a) => this.avaliacoes.set(a), error: () => this.avaliacoes.set([]) });
      if (this.auth.logado()) this.api.favoritos().subscribe({ next: (f) => this.favorito.set(f.includes(id)), error: () => { /* opcional */ } });
    }, { allowSignalWrites: true });
  }

  carregarAgenda(id: number) {
    const inicio = new Date(); inicio.setHours(0,0,0,0);
    const fim = new Date(inicio); fim.setDate(fim.getDate()+30);
    const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    this.carregandoAgenda.set(true); this.agendaErro.set('');
    this.api.disponibilidadePublica(id, iso(inicio), iso(fim)).subscribe({
      next: (r) => {
        const dias: Array<{data:string;rotulo:string;faixas:string[]}> = [];
        for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate()+1)) {
          const data=iso(d), dow=d.getDay()===0?7:d.getDay();
          const janelas=(r.horarios||[]).filter((h:any)=>Number(h.diaSemana)===dow);
          const indisponivel=(r.ocupados||[]).filter((o:any)=>o.data===data).map((o:any)=>[o.inicio,o.fim]);
          const bloqueios=(r.bloqueios||[]).filter((b:any)=>b.inicio.slice(0,10)<=data && b.fim.slice(0,10)>=data);
          const faixas:string[]=[];
          for (const h of janelas) {
            let inicioMin=this.minutos(h.inicio), fimMin=this.minutos(h.fim);
            const cortes=[...indisponivel.map((x:any)=>[this.minutos(x[0]),this.minutos(x[1])]),...bloqueios.map((x:any)=>[x.inicio.slice(0,10)===data?this.minutos(x.inicio.slice(11,16)):0,x.fim.slice(0,10)===data?this.minutos(x.fim.slice(11,16)):1440])].sort((a,b)=>a[0]-b[0]);
            let cursor=inicioMin;
            for(const c of cortes){ if(c[0]>cursor) faixas.push(`${this.hhmm(cursor)}–${this.hhmm(Math.min(c[0],fimMin))}`); cursor=Math.max(cursor,c[1]); }
            if(cursor<fimMin) faixas.push(`${this.hhmm(cursor)}–${this.hhmm(fimMin)}`);
          }
          const rotulo=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'}).format(d);
          dias.push({data,rotulo,faixas:faixas.filter(x=>x.split('–')[0]!==x.split('–')[1])});
        }
        this.agendaDias.set(dias); this.carregandoAgenda.set(false);
      }, error:(e)=>{this.agendaErro.set(msgErro(e));this.carregandoAgenda.set(false);}
    });
  }
  private minutos(h:string){const [a,b]=h.split(':').map(Number);return a*60+b;}
  private hhmm(m:number){return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;}

  alternarFavorito() {
    this.api.alternarFavorito(Number(this.id())).subscribe({
      next: (r) => this.favorito.set(r.favorito),
      error: (e) => this.erro.set(msgErro(e)),
    });
  }

  denunciar(b: Baba) {
    this.erro.set('');
    this.api.denunciar(this.motivo, `Sobre a babá #${b.id} (${b.nome}). ${this.detalhes}`.trim()).subscribe({
      next: () => { this.aviso.set('Denúncia enviada. Nossa equipe vai analisar.'); this.detalhes = ''; },
      error: (e) => this.erro.set(msgErro(e)),
    });
  }
}
