import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Baba, Confianca } from '../core/models';
import { msgErro } from '../core/util';
import { ScriptLoaderService } from '../core/script-loader.service';
import { UFS } from './ufs';

interface Sugestao { baba: Baba; conf?: Confianca; distanciaKm?: number; }

const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
const CENTROS: Record<string, [number, number]> = {
  'São Paulo': [-23.5505, -46.6333], 'Campinas': [-22.9099, -47.0626], 'Santos': [-23.9608, -46.3336],
};

@Component({
  selector: 'app-agora',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe],
  template: `
    <section class="estreita pagina">
      <h1>Preciso de uma babá agora</h1>
      <p class="muted">Mostramos até 3 profissionais verificadas cadastradas na sua cidade, ordenadas pelo Índice de Confiança. Ao tocar em “Chamar agora”, você envia uma solicitação urgente; a babá ainda precisa aceitar para confirmar o atendimento.</p>
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

      <div class="caixa">
        <div class="campo">
          <label for="rua">Rua / avenida</label>
          <input id="rua" name="rua" type="text" [(ngModel)]="rua" autocomplete="address-line1" placeholder="Ex.: Rua das Flores" required>
        </div>
        <div class="duas-colunas">
          <div class="campo">
            <label for="numero">Número</label>
            <input id="numero" name="numero" type="text" [(ngModel)]="numero" autocomplete="address-line2" placeholder="Ex.: 250" required>
          </div>
          <div class="campo">
            <label for="complemento">Complemento (opcional)</label>
            <input id="complemento" name="complemento" type="text" [(ngModel)]="complemento" placeholder="Apto, bloco, casa...">
          </div>
        </div>
        <div class="duas-colunas">
          <div class="campo">
            <label for="bairro">Bairro</label>
            <input id="bairro" name="bairro" type="text" [(ngModel)]="bairro" autocomplete="address-level3" placeholder="Ex.: Centro" required>
          </div>
          <div class="campo">
            <label for="cep">CEP (opcional)</label>
            <input id="cep" name="cep" type="text" [(ngModel)]="cep" autocomplete="postal-code" placeholder="00000-000" maxlength="9">
          </div>
        </div>
        <div class="duas-colunas">
          <div class="campo">
            <label for="cidade">Cidade</label>
            <select id="cidade" name="cidade" [(ngModel)]="cidade" (ngModelChange)="buscarNaCidade()" autocomplete="address-level2" [disabled]="carregandoCidades() || cidades().length === 0" required><option value="">Selecione a cidade</option>@for (c of cidades(); track c.id) { <option [value]="c.nome">{{ c.nome }}</option> }</select>
          </div>
          <div class="campo">
            <label for="uf">Estado</label>
            <select id="uf" name="uf" [(ngModel)]="uf" autocomplete="address-level1" (ngModelChange)="carregarCidades($event)" required><option value="">Selecione o estado</option>@for (u of ufs; track u.sigla) { <option [value]="u.sigla">{{ u.nome }} ({{ u.sigla }})</option> }</select>
          </div>
        </div>
        <div class="campo">
          <label for="referencia">Ponto de referência (opcional)</label>
          <input id="referencia" name="referencia" type="text" [(ngModel)]="referencia" placeholder="Ex.: próximo à praça ou portaria principal">
          <span class="ajuda">Informe número e bairro para a babá localizar o endereço corretamente.</span>
        </div>
        <div class="duas-colunas">
          <div class="campo">
            <label for="qtd">Crianças</label>
            <select id="qtd" name="qtd" [(ngModel)]="qtd"><option [ngValue]="1">1</option><option [ngValue]="2">2</option><option [ngValue]="3">3</option></select>
          </div>
          <div class="campo">
            <label for="dur">Duração</label>
            <select id="dur" name="dur" [(ngModel)]="horas"><option [ngValue]="2">2 horas</option><option [ngValue]="4">4 horas</option><option [ngValue]="8">8 horas</option></select>
          </div>
        </div>
      </div>

      @if (temMapa()) {
        <div id="mapa-agora" class="mapa" role="img" aria-label="Mapa com a posição simulada das babás sugeridas"></div>
        <p class="muted">O mapa mostra somente localizações GPS compartilhadas pelas profissionais. A distância exibida é aproximada, em linha reta, e depende da permissão de localização.</p>
      }

      @if (carregando()) { <div class="esqueleto" style="margin-top:1rem"></div> }
      @for (s of sugestoes(); track s.baba.id) {
        <article class="caixa solic" style="margin-top:1.4rem">
          <div class="linha">
            <div style="display:flex;align-items:center;gap:1rem">
              @if (s.conf; as c) {
                <div class="anel" [style.--p]="c.score" role="img" [attr.aria-label]="'Índice de confiança ' + c.score + ' de 100'"><div class="disco"><b>{{ c.score }}</b></div></div>
              }
              <div>
                <strong>{{ s.baba.nome }}</strong><br>
                <span class="muted">{{ s.baba.experienciaAnos || 0 }} anos, nota {{ s.baba.notaMedia | number: '1.1-1' }}, {{ s.baba.valorHora | currency: 'BRL' }} por hora</span><br><span class="muted">{{ s.distanciaKm != null ? (s.distanciaKm | number: '1.1-1') + ' km de distância aproximada' : 'Distância não disponível' }}</span>
              </div>
            </div>
            <button type="button" class="btn sol" (click)="chamar(s.baba)" [disabled]="enviando()">Chamar agora</button>
          </div>
        </article>
      }
      @if (!carregando() && sugestoes().length === 0 && !erro()) {
        <div class="vazio-estado"><p>No momento, não há babás verificadas que tenham ativado “Estou disponível para atendimento imediato” nesta cidade. Tente novamente mais tarde ou use “Encontrar babá” para agendar.</p></div>
      }
    </section>
  `,
})
export class AgoraComponent implements OnInit {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  readonly ufs = UFS;
  cidades = signal<{id:number;nome:string}[]>([]);
  carregandoCidades = signal(false);
  private auth = inject(AuthService);
  private router = inject(Router);
  private loader = inject(ScriptLoaderService);

  paiId: number | null = null;
  rua = '';
  numero = '';
  complemento = '';
  bairro = '';
  cep = '';
  referencia = '';
  uf = '';
  qtd = 1;
  horas = 2;
  cidade = '';

  sugestoes = signal<Sugestao[]>([]);
  carregando = signal(true);
  enviando = signal(false);
  temMapa = signal(false);
  erro = signal('');
  private coordenadasResponsavel: [number, number] | null = null;

  ngOnInit() {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => { this.coordenadasResponsavel = [pos.coords.latitude, pos.coords.longitude]; const ordenadas = this.sugestoes().map(s => ({ ...s, distanciaKm: this.distancia(s.baba) })).sort((a,b) => (a.distanciaKm ?? Number.POSITIVE_INFINITY) - (b.distanciaKm ?? Number.POSITIVE_INFINITY)); if (ordenadas.length) this.sugestoes.set(ordenadas); }, () => { this.coordenadasResponsavel = null; }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
    this.api.paiPorUsuario(this.auth.sessao()!.id).subscribe({
      next: (p) => {
        this.paiId = p.id;
        this.cidade = p.cidade || ''; this.uf = p.estado || ''; this.carregarCidades(this.uf, this.cidade);
        this.api.pai(p.id).subscribe({ next: (d) => { this.rua = d.endereco || ''; }, error: () => { /* opcional */ } });
        forkJoin({ babas: this.api.babasDisponiveis(this.cidade), conf: this.api.confiancas() }).subscribe({
          next: ({ babas, conf }) => {
            const candidatas = babas.filter((b) => b.verificada && b.disponivelAgora).map(b => ({ baba: b, conf: conf[b.id], distanciaKm: this.distancia(b) }));
            candidatas.sort((x, y) => { if (x.distanciaKm != null && y.distanciaKm != null) return x.distanciaKm - y.distanciaKm; if (x.distanciaKm != null) return -1; if (y.distanciaKm != null) return 1; return (conf[y.baba.id]?.score ?? 0) - (conf[x.baba.id]?.score ?? 0); });
            const top = candidatas.slice(0, 3);
            this.sugestoes.set(top);
            this.carregando.set(false);
            if (top.length) setTimeout(() => this.desenharMapa(top.map((s) => s.baba)));
          },
          error: (e) => { this.erro.set(msgErro(e)); this.carregando.set(false); },
        });
      },
      error: (e) => { this.erro.set(msgErro(e)); this.carregando.set(false); },
    });
  }

  carregarCidades(uf: string, cidadeInicial = '') {
    this.cidade = cidadeInicial || ''; this.cidades.set([]); if (!uf) return; this.carregandoCidades.set(true);
    this.http.get<{id:number;nome:string}[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios?orderBy=nome`).subscribe({
      next: lista => { this.cidades.set(lista); this.carregandoCidades.set(false); if (cidadeInicial && lista.some(x => x.nome === cidadeInicial)) this.cidade = cidadeInicial; },
      error: () => this.carregandoCidades.set(false)
    });
  }

  buscarNaCidade() {
    if (!this.cidade) return;
    this.carregando.set(true); this.erro.set('');
    forkJoin({ babas: this.api.babasDisponiveis(this.cidade), conf: this.api.confiancas() }).subscribe({
      next: ({ babas, conf }) => {
        const candidatas = babas.filter(b => b.verificada && b.disponivelAgora).map(b => ({ baba: b, conf: conf[b.id], distanciaKm: this.distancia(b) }));
        candidatas.sort((x,y) => (x.distanciaKm ?? Number.POSITIVE_INFINITY) - (y.distanciaKm ?? Number.POSITIVE_INFINITY));
        const top = candidatas.slice(0,3); this.sugestoes.set(top); this.carregando.set(false);
        if (top.length) setTimeout(() => this.desenharMapa(top.map(x => x.baba)));
      }, error: e => { this.erro.set(msgErro(e)); this.carregando.set(false); }
    });
  }

  private async desenharMapa(babas: Baba[]) {
    try {
      this.loader.css(LEAFLET_CSS);
      await this.loader.script(LEAFLET_JS);
      this.temMapa.set(true);
      await new Promise((r) => setTimeout(r, 50));
      const L = (window as any).L;
      const pontos = babas.filter(b => b.latitude != null && b.longitude != null);
      if (!pontos.length) { this.temMapa.set(false); return; }
      const centro = this.coordenadasResponsavel ?? [pontos[0].latitude!, pontos[0].longitude!] as [number, number];
      const mapa = L.map('mapa-agora').setView(centro, 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(mapa);
      if (this.coordenadasResponsavel) L.marker(this.coordenadasResponsavel).addTo(mapa).bindPopup('Sua localização (compartilhada pelo navegador)');
      pontos.forEach((b) => L.marker([b.latitude, b.longitude]).addTo(mapa).bindPopup(b.nome));
    } catch {
      this.temMapa.set(false); // sem internet para o mapa: a lista continua funcionando
    }
  }

  private distancia(b: Baba): number | undefined {
    if (!this.coordenadasResponsavel || b.latitude == null || b.longitude == null) return undefined;
    const rad = (v: number) => v * Math.PI / 180;
    const [lat1, lon1] = this.coordenadasResponsavel; const lat2 = b.latitude; const lon2 = b.longitude;
    const dLat = rad(lat2-lat1), dLon = rad(lon2-lon1);
    const h = Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  }

  chamar(b: Baba) {
    if (!this.rua.trim() || !this.numero.trim() || !this.bairro.trim() || !this.cidade.trim() || !this.uf.trim()) { this.erro.set('Informe rua, número, bairro, cidade e estado para localizar o atendimento.'); return; }
    const endereco = [this.rua.trim(), `nº ${this.numero.trim()}`, this.complemento.trim(), this.bairro.trim(), `${this.cidade.trim()} - ${this.uf.trim().toUpperCase()}`, this.cep.trim() ? `CEP ${this.cep.trim()}` : '', this.referencia.trim() ? `Referência: ${this.referencia.trim()}` : ''].filter(Boolean).join(', ');
    const hh = (d: Date) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const agora = new Date();
    const fim = new Date(agora.getTime() + this.horas * 3_600_000);
    const dia = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    this.enviando.set(true);
    this.erro.set('');
    this.api.criarAgendamento({
      paiId: this.paiId, babaId: b.id, dataServico: dia, horaInicio: hh(agora),
      horaFim: fim.getDate() !== agora.getDate() ? '23:59' : hh(fim),
      endereco, quantidadeCriancas: this.qtd, observacoes: 'URGENTE',
    }).subscribe({
      next: (a) => this.router.navigate(['/atendimento', a.id]),
      error: (e) => { this.erro.set(msgErro(e)); this.enviando.set(false); },
    });
  }
}
