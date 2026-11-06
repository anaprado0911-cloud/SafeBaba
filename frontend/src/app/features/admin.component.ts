import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { BabaAdmin, DocPendente, ResumoAdmin, SosAdmin } from '../core/models';
import { msgErro } from '../core/util';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  template: `
    <section class="container pagina">
      <h1>Central de moderação</h1>
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

      <!-- SOS aparece primeiro para dar prioridade aos pedidos de ajuda -->
      <section class="central-sos" aria-labelledby="titulo-sos">
        <div class="linha">
          <h2 id="titulo-sos">🚨 Central de emergência — SOS</h2>
          <strong>{{ sos().length }} alerta(s)</strong>
        </div>
        @if (sos().length === 0) {
          <div class="caixa"><p style="margin:0">Nenhum alerta SOS registrado.</p></div>
        }
        @for (s of sos(); track $index) {
          <article class="caixa solic alerta-sos">
            <div class="linha">
              <strong>Alerta SOS #{{ s.agendamentoId }}</strong>
              <span class="status PENDENTE">EMERGÊNCIA</span>
            </div>
            <p><strong>Horário:</strong> {{ s.criadoEm | date:'dd/MM/yyyy HH:mm' }}</p>
            <p>{{ s.texto }}</p>
            <div class="botoes">
              <a class="btn pequeno sol" href="tel:190">Avisar autoridades (190)</a>
              <a class="btn pequeno" [href]="linkAutoridadesProximas(s)" target="_blank" rel="noopener noreferrer">Encontrar autoridades próximas</a>
            </div>
          </article>
        }
      </section>

      @if (resumo(); as r) {
        <div class="numeros">
          <div class="caixa numero"><b>{{ r.usuarios }}</b>usuários</div>
          <div class="caixa numero"><b>{{ r.babasVerificadas }}</b>babás verificadas</div>
          <div class="caixa numero"><b>{{ r.documentosPendentes ?? docs().length }}</b>documentos pendentes</div>
          <div class="caixa numero"><b>{{ r.babasPendentes ?? 0 }}</b>babás pendentes</div>
          <div class="caixa numero"><b>{{ r.babasReprovadas ?? 0 }}</b>babás reprovadas</div>
          <div class="caixa numero"><b>{{ r.agendamentos }}</b>agendamentos</div>
          <div class="caixa numero"><b>{{ r.denuncias }}</b>denúncias</div>
          <div class="caixa numero"><b>{{ r.sos }}</b>alertas SOS</div>
        </div>
      }

      <h2>Documentos para aprovar</h2>
      @if (docs().length === 0) { <div class="caixa"><p style="margin:0">Nenhum documento pendente.</p></div> }
      @for (d of docs(); track d.babaId) {
        <article class="caixa solic">
          <div class="linha">
            <div><strong>{{ d.nome }}</strong><br><span class="muted">{{ d.tipo }} · Babá #{{ d.babaId }}</span></div>
            <span class="status PENDENTE">{{ d.status }}</span>
          </div>
          <p><strong>Arquivo:</strong> {{ d.nomeArquivo || 'Não informado' }}</p>
          @if (d.temArquivo) { <div class="botoes"><button type="button" class="btn pequeno" (click)="abrirDocumento(d)">Visualizar documento</button></div> }
          <div class="botoes">
            <button type="button" class="btn pequeno" (click)="aprovar(d)">Aprovar documento</button>
            <button type="button" class="btn pequeno vazio" (click)="reprovarDocumento(d)">Reprovar documento</button>
          </div>
        </article>
      }

      <h2 style="margin-top:2rem">Verificação de babás</h2>
      <div class="caixa">
        <div class="campo">
          <label for="filtroBaba">Filtrar cadastros</label>
          <select id="filtroBaba" [value]="filtroBaba()" (change)="filtroBaba.set($any($event.target).value)">
            <option value="TODAS">Todas as babás</option>
            <option value="PENDENTE">Aguardando verificação</option>
            <option value="VERIFICADA">Verificadas</option>
            <option value="REPROVADA">Reprovadas</option>
          </select>
        </div>
        <p class="muted">{{ babasFiltradas().length }} babá(s) encontrada(s).</p>
        @if (babasFiltradas().length === 0) { <p>Nenhuma babá encontrada.</p> }
        @for (b of babasFiltradas(); track b.id) {
          <article class="caixa solic">
            <div class="linha">
              <div><strong>{{ b.nome }}</strong><br><span class="muted">{{ b.email }} · {{ b.cidade || 'Cidade não informada' }}/{{ b.estado || '' }}</span></div>
              <span class="status" [class.PENDENTE]="b.statusVerificacao === 'PENDENTE'">{{ rotuloStatusBaba(b.statusVerificacao) }}</span>
            </div>
            <p><strong>Telefone:</strong> {{ b.telefone }} · <strong>Experiência:</strong> {{ b.experienciaAnos ?? 0 }} ano(s)</p>
            <p><strong>Valor por hora:</strong> {{ b.valorHora == null ? 'Não informado' : (b.valorHora | currency:'BRL') }}</p>
            <p><strong>Disponibilidade:</strong> {{ b.disponibilidade || 'Não informada' }}</p>
            <p><strong>Apresentação:</strong> {{ b.descricao || 'Não informada' }}</p>
            <p><strong>Documento:</strong> {{ b.documentoTipo || 'Não enviado' }} · {{ b.documentoStatus }}</p>
            @if (b.motivoVerificacao) { <p><strong>Motivo da reprovação:</strong> {{ b.motivoVerificacao }}</p> }
            @if (b.motivoDocumento) { <p><strong>Motivo da reprovação do documento:</strong> {{ b.motivoDocumento }}</p> }
            @if (b.statusVerificacao !== 'VERIFICADA') {
              <div class="botoes">
                <button type="button" class="btn pequeno" [disabled]="b.documentoStatus !== 'APROVADO'" (click)="aprovarBaba(b)">Verificar babá</button>
                <button type="button" class="btn pequeno vazio" (click)="reprovarBaba(b)">Reprovar cadastro</button>
              </div>
              @if (b.documentoStatus !== 'APROVADO') { <small class="muted">Para verificar a babá, aprove primeiro o documento obrigatório.</small> }
            }
          </article>
        }
      </div>

      <h2 style="margin-top:2rem">Usuários cadastrados</h2>
      <div class="caixa">
        <div class="duas-colunas">
          <div class="campo">
            <label for="filtroTipo">Filtrar por perfil</label>
            <select id="filtroTipo" [value]="filtroTipo()" (change)="filtroTipo.set($any($event.target).value)">
              <option value="TODOS">Todos os usuários</option>
              <option value="PAI">Responsáveis</option>
              <option value="BABA">Babás</option>
            </select>
          </div>
          <div class="campo">
            <label for="buscaUsuario">Pesquisar usuário</label>
            <input id="buscaUsuario" type="text" placeholder="Digite nome ou e-mail..." [value]="buscaUsuario()" (input)="buscaUsuario.set($any($event.target).value)">
          </div>
        </div>
        <p class="muted">{{ usuariosFiltrados().length }} usuário(s) encontrado(s) de {{ usuarios().length }} cadastrado(s).</p>
        <div style="overflow:auto">
          <table>
            <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Cidade</th></tr></thead>
            <tbody>
              @for(u of usuariosFiltrados();track u.id){<tr><td>{{u.nome}}</td><td>{{u.email}}</td><td>{{u.tipo}}</td><td>{{u.cidade}}/{{u.estado}}</td></tr>}
              @if (usuariosFiltrados().length === 0) { <tr><td colspan="4" style="text-align:center">Nenhum usuário encontrado.</td></tr> }
            </tbody>
          </table>
        </div>
      </div>

      <h2 style="margin-top:2rem">Denúncias e ocorrências</h2>
      @if (denuncias().length === 0) { <div class="caixa"><p style="margin:0">Nenhuma denúncia registrada.</p></div> }
      @for (d of denuncias(); track d.id) {
        <article class="caixa solic"><div class="linha"><strong>#{{d.id}} · {{d.motivo}}</strong><span class="status PENDENTE">{{d.status}}</span></div>
        <p>{{d.usuario}} ({{d.email}})</p><p>{{d.descricao}}</p>
        @if(d.status !== 'RESOLVIDA' && d.status !== 'ARQUIVADA') {<div class="botoes"><button class="btn pequeno" (click)="statusDenuncia(d,'EM_ANALISE')">Em análise</button><button class="btn pequeno sol" (click)="statusDenuncia(d,'RESOLVIDA')">Resolver</button><button class="btn pequeno vazio" (click)="statusDenuncia(d,'ARQUIVADA')">Arquivar</button></div>}
        </article>
      }
      <h2 style="margin-top:2rem">Agendamentos recentes</h2>
      @for(g of agendamentos();track g.id){<article class="caixa solic"><div class="linha"><b>#{{g.id}} · {{g.responsavel}} / {{g.baba}}</b><span class="status">{{g.status}}</span></div><p>{{g.data}} · {{g.inicio}}–{{g.fim}}</p><small class="muted">{{g.endereco}}</small></article>}
    </section>
  
  `,
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  resumo = signal<ResumoAdmin | null>(null);
  docs = signal<DocPendente[]>([]);
  babas = signal<BabaAdmin[]>([]);
  filtroBaba = signal('TODAS');
  babasFiltradas = computed(() => this.filtroBaba() === 'TODAS' ? this.babas() : this.babas().filter(b => b.statusVerificacao === this.filtroBaba()));
  sos = signal<SosAdmin[]>([]);
  agendamentos = signal<any[]>([]);
  denuncias = signal<any[]>([]);
  usuarios = signal<any[]>([]);
  filtroTipo = signal('TODOS');
  buscaUsuario = signal('');
  usuariosFiltrados = computed(() => {
    const tipo = this.filtroTipo();
    const busca = this.buscaUsuario().trim().toLocaleLowerCase('pt-BR');
    return this.usuarios().filter(u =>
      (tipo === 'TODOS' || u.tipo === tipo) &&
      (!busca || String(u.nome ?? '').toLocaleLowerCase('pt-BR').includes(busca) ||
        String(u.email ?? '').toLocaleLowerCase('pt-BR').includes(busca))
    );
  });
  erro = signal('');

  ngOnInit() {
    this.api.resumoAdmin().subscribe({ next: (r) => this.resumo.set(r), error: (e) => this.erro.set(msgErro(e)) });
    this.carregarDocumentos();
    this.carregarBabas();
    this.api.sosAdmin().subscribe({ next: (s) => this.sos.set(s), error: (e) => this.erro.set(msgErro(e)) });
    this.api.adminUsuarios().subscribe({next:u=>this.usuarios.set(u),error:e=>this.erro.set(msgErro(e))});
    this.api.adminAgendamentos().subscribe({next:g=>this.agendamentos.set(g),error:e=>this.erro.set(msgErro(e))});
    this.api.adminDenuncias().subscribe({next:d=>this.denuncias.set(d),error:e=>this.erro.set(msgErro(e))});
  }

  linkAutoridadesProximas(s: SosAdmin): string {
    let latitude = s.latitude;
    let longitude = s.longitude;

    // Compatibilidade com alertas já gravados antes de latitude/longitude
    // serem retornadas separadamente pela API.
    if (latitude == null || longitude == null) {
      const coordenadas = s.texto.match(/local:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
      if (coordenadas) {
        latitude = Number(coordenadas[1]);
        longitude = Number(coordenadas[2]);
      }
    }

    let destino = 'delegacia próxima';
    if (latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      destino = `${latitude},${longitude}`;
    } else if (s.endereco) {
      destino = `delegacia próxima de ${s.endereco}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destino)}`;
  }

  statusDenuncia(d:any,status:string){this.api.atualizarDenuncia(d.id,status).subscribe({next:()=>this.denuncias.update(l=>l.map(x=>x.id===d.id?{...x,status}:x)),error:e=>this.erro.set(msgErro(e))});}

  carregarDocumentos() {
    this.api.docsPendentes().subscribe({ next: d => this.docs.set(d), error: e => this.erro.set(msgErro(e)) });
  }

  carregarBabas() {
    this.api.adminBabas().subscribe({ next: b => this.babas.set(b), error: e => this.erro.set(msgErro(e)) });
  }

  atualizarPainel() {
    this.api.resumoAdmin().subscribe({ next: r => this.resumo.set(r), error: e => this.erro.set(msgErro(e)) });
    this.carregarDocumentos();
    this.carregarBabas();
  }

  abrirDocumento(d: DocPendente) {
    this.api.abrirDocumentoAdmin(d.babaId).subscribe({
      next: blob => { const url = URL.createObjectURL(blob); window.open(url, '_blank', 'noopener,noreferrer'); setTimeout(() => URL.revokeObjectURL(url), 60000); },
      error: e => this.erro.set(msgErro(e))
    });
  }

  aprovar(d: DocPendente) {
    if (!window.confirm(`Confirma a aprovação do documento de ${d.nome}?`)) return;
    this.api.aprovarDoc(d.babaId).subscribe({
      next: () => this.atualizarPainel(),
      error: e => this.erro.set(msgErro(e)),
    });
  }

  reprovarDocumento(d: DocPendente) {
    const motivo = window.prompt(`Informe o motivo da reprovação do documento de ${d.nome}:`);
    if (!motivo || !motivo.trim()) return;
    this.api.reprovarDoc(d.babaId, motivo.trim()).subscribe({
      next: () => this.atualizarPainel(),
      error: e => this.erro.set(msgErro(e)),
    });
  }

  aprovarBaba(b: BabaAdmin) {
    if (!window.confirm(`Confirma a verificação do cadastro de ${b.nome}?`)) return;
    this.api.aprovarBaba(b.id).subscribe({
      next: () => this.atualizarPainel(),
      error: e => this.erro.set(msgErro(e)),
    });
  }

  reprovarBaba(b: BabaAdmin) {
    const motivo = window.prompt(`Informe o motivo da reprovação do cadastro de ${b.nome}:`);
    if (!motivo || !motivo.trim()) return;
    this.api.reprovarBaba(b.id, motivo.trim()).subscribe({
      next: () => this.atualizarPainel(),
      error: e => this.erro.set(msgErro(e)),
    });
  }

  rotuloStatusBaba(status: string): string {
    if (status === 'VERIFICADA') return 'VERIFICADA';
    if (status === 'REPROVADA') return 'REPROVADA';
    return 'PENDENTE';
  }
}
