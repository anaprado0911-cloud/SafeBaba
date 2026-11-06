import { Component, ElementRef, ViewChild, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Cuidado, EventoLinha } from '../core/models';
import { ScriptLoaderService } from '../core/script-loader.service';
import { ROTULO_EVENTO, msgErro } from '../core/util';

const QR_URL = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

@Component({
  selector: 'app-atendimento',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <section class="container pagina estreita" style="width:min(760px,100% - 2rem)">
      <h1>Acompanhamento ao vivo</h1>
      <p class="muted">Código de chegada, diário e alerta de emergência em um só lugar. A tela se atualiza a cada 5 segundos.</p>
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

      <div class="caixa">
        @if (ehPai()) {
          @if (chegou()) {
            <p style="margin:0">Babá no local. Você acompanha tudo abaixo.</p>
          } @else {
            <p>Quando a babá chegar, informe este código ou mostre o QR Code:</p>
            @if (codigoAtual(); as cod) {
              <div class="codigo">{{ cod }}</div>
              <div #qr style="margin:12px 0"></div>
            }
            <button type="button" class="btn" (click)="acao('codigo')">{{ codigoAtual() ? 'Gerar novo código' : 'Gerar código de chegada' }}</button>
          }
        } @else if (ehBaba()) {
          @if (!chegou()) {
            <p>Peça o código ao responsável ao chegar.</p>
            <div class="acoes-linha">
              <label class="sr-only" for="cod">Código de 6 dígitos</label>
              <input id="cod" type="text" inputmode="numeric" maxlength="6" placeholder="Código de 6 dígitos" [(ngModel)]="digitado">
              <button type="button" class="btn" (click)="acao('checkin', { codigo: digitado.trim() })">Confirmar chegada</button>
              <button type="button" class="btn vazio" (click)="escanear()">Escanear QR</button>
            </div>
            @if (camera()) { <video #video playsinline style="width:100%;max-width:320px;border-radius:12px;border:2.5px solid var(--linha)"></video> }
          } @else if (emAndamento()) {
            <div class="acoes-linha">
              @for (a of atalhos; track a) { <button type="button" class="btn vazio pequeno" (click)="registrar(a)">{{ a }}</button> }
            </div>
            <div class="acoes-linha">
              <label class="sr-only" for="obs">Observação</label>
              <input id="obs" type="text" maxlength="300" placeholder="Observação" [(ngModel)]="obs">
              <button type="button" class="btn vazio" (click)="registrar(obs)">Enviar</button>
              <button type="button" class="btn sol" (click)="acao('checkout')">Encerrar atendimento</button>
            </div>
          } @else {
            <p style="margin:0">Atendimento encerrado.</p>
          }
        }
      </div>

      @if (ehPai() && !pagamentoRetido() && !encerrado()) {
        <p><button type="button" class="btn vazio" (click)="acao('pagar')">Pagar via PIX (simulado)</button></p>
      }

      @if (cuidados().length) {
        <div class="caixa" style="margin-top:1.2rem">
          <h3>Cartão de cuidados</h3>
          @for (c of cuidados(); track c.id) {
            <p><b>{{ c.nome }}</b> ({{ c.idade }} anos)<br>
              Alergias: {{ c.alergias || '—' }}<br>
              Remédios: {{ c.remedios || '—' }}<br>
              Rotina: {{ c.rotina || '—' }}<br>
              Pediatra: {{ c.pediatra || '—' }}, emergência: {{ c.contato || '—' }}</p>
          }
        </div>
      }

      @if (ehPai() && encerrado()) {
        <div class="caixa" style="margin-top:1.2rem">
          @if (avaliado()) {
            <p style="margin:0"><b>Obrigado pela avaliação!</b></p>
          } @else {
            <h3>Como foi o atendimento?</h3>
            <div class="acoes-linha">
              <label class="sr-only" for="nota">Nota</label>
              <select id="nota" [(ngModel)]="nota">
                <option [ngValue]="5">5 estrelas</option><option [ngValue]="4">4 estrelas</option><option [ngValue]="3">3 estrelas</option>
                <option [ngValue]="2">2 estrelas</option><option [ngValue]="1">1 estrela</option>
              </select>
              <label><input type="checkbox" [(ngModel)]="pont"> Pontual</label>
              <label><input type="checkbox" [(ngModel)]="comu"> Boa comunicação</label>
              <label><input type="checkbox" [(ngModel)]="expe"> Experiente</label>
            </div>
            <div class="acoes-linha">
              <label class="sr-only" for="com">Comentário</label>
              <input id="com" type="text" maxlength="400" placeholder="Comentário (opcional)" [(ngModel)]="comentario">
              <button type="button" class="btn" (click)="avaliar()">Enviar avaliação</button>
            </div>
          }
        </div>
      }

      <div class="acoes-linha" style="margin-top:1.2rem">
        <label class="sr-only" for="msg">Mensagem</label>
        <input id="msg" type="text" maxlength="300" placeholder="Escreva uma mensagem" [(ngModel)]="msg" (keyup.enter)="enviarMsg()">
        <button type="button" class="btn vazio" (click)="enviarMsg()">Enviar</button>
      </div>

      <h2 style="margin-top:1.6rem">Linha do tempo e conversa</h2>
      @if (linha().length === 0) { <p class="muted">Nada registrado ainda.</p> }
      <ul class="tl">
        @for (e of linha(); track $index) {
          <li [class]="e.tipo">
            <b>{{ rotulo[e.tipo] || e.tipo }}</b>
            @if (e.tipo === 'DIARIO' || e.tipo === 'SOS' || e.tipo === 'MSG') {
              <br>{{ e.tipo === 'MSG' ? (e.de === 'PAI' ? 'Responsável: ' : 'Babá: ') : '' }}{{ e.texto }}
            }
            <br><small>{{ e.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</small>
          </li>
        }
      </ul>
      <p><a routerLink="/agenda">Voltar para a agenda</a></p>
    </section>
    <button type="button" class="sos" aria-label="Acionar alerta SOS" (click)="sos()">SOS</button>
  `,
})
export class AtendimentoComponent {
  private api = inject(ApiService);
  private loader = inject(ScriptLoaderService);
  auth = inject(AuthService);

  id = input.required<string>(); // parâmetro da rota
  codigo = input<string>(); // ?codigo= quando a babá abre o link do QR Code
  readonly rotulo = ROTULO_EVENTO;
  readonly atalhos = ['Comeu', 'Dormiu', 'Trocou fralda', 'Tomou remédio', 'Brincando'];

  linha = signal<EventoLinha[]>([]);
  cuidados = signal<Cuidado[]>([]);
  erro = signal('');
  camera = signal(false);
  avaliado = signal(false);

  digitado = ''; obs = ''; msg = '';
  nota = 5; pont = true; comu = true; expe = true; comentario = '';

  ehPai = computed(() => this.auth.tipo() === 'PAI');
  ehBaba = computed(() => this.auth.tipo() === 'BABA');
  chegou = computed(() => this.linha().some((e) => e.tipo === 'CHECKIN'));
  encerrado = computed(() => this.linha().some((e) => e.tipo === 'CHECKOUT'));
  emAndamento = computed(() => this.chegou() && !this.encerrado());
  pagamentoRetido = computed(() => this.linha().some((e) => e.tipo === 'PAGTO_RETIDO'));
  codigoAtual = computed(() => {
    const l = this.linha();
    for (let i = l.length - 1; i >= 0; i--) if (l[i].tipo === 'CODIGO') return l[i].texto;
    return null;
  });

  private qrEl?: HTMLElement;
  private qrDesenhado = '';
  private videoEl?: HTMLVideoElement;
  private cuidadosCarregados = false;
  private checkinPorLinkFeito = false;

  @ViewChild('qr') set qrRef(el: ElementRef<HTMLElement> | undefined) { this.qrEl = el?.nativeElement; setTimeout(() => this.desenharQr()); }
  @ViewChild('video') set videoRef(el: ElementRef<HTMLVideoElement> | undefined) { this.videoEl = el?.nativeElement; }

  constructor() {
    effect(() => { this.id(); this.carregar(); }, { allowSignalWrites: true });
    effect(() => { this.codigoAtual(); setTimeout(() => this.desenharQr()); });
    interval(5000).pipe(takeUntilDestroyed()).subscribe(() => this.carregar());
  }

  private get n() { return Number(this.id()); }

  carregar() {
    this.api.linha(this.n).subscribe({
      next: (l) => { this.linha.set(l); this.erro.set(''); this.atualizarCuidados(); this.checkinPorLink(); },
      error: (e) => this.erro.set(msgErro(e)),
    });
  }

  acao(caminho: string, corpo: object = {}, depois?: () => void) {
    this.erro.set('');
    this.api.acao(this.n, caminho, corpo).subscribe({
      next: () => { depois?.(); this.carregar(); },
      error: (e) => this.erro.set(msgErro(e)),
    });
  }

  registrar(texto: string) { if (texto.trim()) this.acao('diario', { texto: texto.trim() }, () => (this.obs = '')); }
  enviarMsg() { const t = this.msg.trim(); if (t) this.acao('mensagem', { texto: t }, () => (this.msg = '')); }

  sos() {
    if (!confirm('Acionar o alerta SOS agora?')) return;
    const enviar = (local?: string) => this.acao('sos', local ? { local } : {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => enviar(`${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`),
        () => enviar(),
        { timeout: 4000 });
    } else {
      enviar();
    }
  }

  avaliar() {
    this.api.avaliar({
      agendamentoId: this.n, nota: Number(this.nota), comentario: this.comentario,
      pontualidade: this.pont, comunicacao: this.comu, experiencia: this.expe,
    }).subscribe({ next: () => this.avaliado.set(true), error: (e) => this.erro.set(msgErro(e)) });
  }

  /** Responsável sempre vê o cartão; a babá só durante o atendimento em andamento. */
  private atualizarCuidados() {
    if (!(this.ehPai() || this.emAndamento())) { this.cuidados.set([]); this.cuidadosCarregados = false; return; }
    if (this.cuidadosCarregados) return;
    this.cuidadosCarregados = true;
    this.api.cuidadosDoAtendimento(this.n).subscribe({
      next: (c) => this.cuidados.set(c),
      error: () => { this.cuidadosCarregados = false; },
    });
  }

  /** Quando a babá abre o link do QR Code (?codigo=...), a chegada é confirmada sozinha. */
  private checkinPorLink() {
    const cod = this.codigo();
    if (cod && this.ehBaba() && !this.chegou() && !this.checkinPorLinkFeito) {
      this.checkinPorLinkFeito = true;
      this.acao('checkin', { codigo: cod });
    }
  }

  private async desenharQr() {
    const el = this.qrEl;
    const cod = this.codigoAtual();
    if (!el || !cod) return;
    const url = `${location.origin}/#/atendimento/${this.n}?codigo=${encodeURIComponent(cod)}`;
    if (this.qrDesenhado === url && el.childElementCount > 0) return;
    try {
      await this.loader.script(QR_URL);
      el.innerHTML = '';
      new (window as any).QRCode(el, { text: url, width: 180, height: 180 });
      this.qrDesenhado = url;
    } catch { /* sem a biblioteca, continua valendo o código numérico */ }
  }

  async escanear() {
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) { this.erro.set('Este navegador não lê QR Code. Use a câmera do celular ou digite o código.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.camera.set(true);
      await new Promise((r) => setTimeout(r, 60));
      const v = this.videoEl;
      if (!v) { stream.getTracks().forEach((t) => t.stop()); return; }
      v.srcObject = stream;
      await v.play();
      const detector = new Detector({ formats: ['qr_code'] });
      const parar = () => { stream.getTracks().forEach((t) => t.stop()); v.srcObject = null; this.camera.set(false); };
      const ler = async () => {
        if (!v.srcObject) return;
        const achados = await detector.detect(v).catch(() => []);
        if (achados.length) {
          parar();
          const m = /codigo=(\d{4,10})/.exec(String(achados[0].rawValue));
          if (m) this.acao('checkin', { codigo: m[1] }); else this.erro.set('QR Code inválido.');
          return;
        }
        requestAnimationFrame(ler);
      };
      ler();
    } catch {
      this.camera.set(false);
      this.erro.set('Não foi possível usar a câmera. Digite o código.');
    }
  }
}
