import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { msgErro } from '../core/util';

@Component({
  selector: 'app-mensagem-conversa',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <section class="container pagina conversa-pagina">
      <h1>Conversa com responsável</h1>
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

      <div class="caixa chat-lista" aria-live="polite">
        @if (mensagens().length === 0) {
          <p class="muted">Ainda não há mensagens nesta conversa.</p>
        }
        @for (m of mensagens(); track m.id) {
          <article class="mensagem">
            <b>{{ m.remetente }}</b>
            <p>{{ m.conteudo }}</p>
            <small class="muted">{{ m.enviadaEm | date:'dd/MM/yyyy HH:mm' }}</small>
          </article>
        }
      </div>

      <form class="chat-form" (ngSubmit)="enviar()">
        <label class="sr-only" for="texto-resposta">Mensagem</label>
        <input id="texto-resposta" name="texto" maxlength="1000"
          [(ngModel)]="texto" placeholder="Digite sua mensagem..." required>
        <button class="btn" type="submit" [disabled]="!texto.trim()">Enviar</button>
      </form>
      <p class="voltar"><a routerLink="/mensagens">Voltar para minhas mensagens</a></p>
    </section>
  `,
  styles: [`
    .conversa-pagina { max-width:820px; }
    .chat-lista { min-height:150px; max-height:360px; overflow-y:auto; padding:16px; margin-top:20px; }
    .mensagem { padding:10px 12px; border-bottom:1px solid var(--linha); overflow-wrap:anywhere; }
    .mensagem p { margin:5px 0; white-space:pre-wrap; }
    .chat-form { display:flex; gap:10px; margin-top:14px; align-items:stretch; }
    .chat-form input { flex:1; min-width:0; min-height:48px; padding:10px 14px; border:1px solid var(--linha); border-radius:10px; font:inherit; }
    .chat-form button { min-width:105px; }
    .voltar { margin-top:22px; }
    @media(max-width:600px) {
      .chat-form { flex-direction:column; }
      .chat-form input,.chat-form button { width:100%; min-height:48px; }
    }
  `]
})
export class MensagemConversaComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  conversaId = 0;
  mensagens = signal<any[]>([]);
  texto = '';
  erro = signal('');
  private timer: ReturnType<typeof setInterval> | null = null;
  private socket: WebSocket | null = null;

  ngOnInit(): void {
    this.conversaId = Number(this.route.snapshot.paramMap.get('conversaId'));
    if (!Number.isInteger(this.conversaId) || this.conversaId <= 0) {
      this.erro.set('Conversa inválida.');
      return;
    }
    this.carregar();
    this.conectar();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.socket) { this.socket.onclose = null; this.socket.close(); }
  }

  conectar(): void {
    const token = this.auth.token();
    if (!token) { this.polling(); return; }
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    try {
      this.socket = new WebSocket(`${proto}//${location.host}/ws/chat/${this.conversaId}?token=${encodeURIComponent(token)}`);
      this.socket.onmessage = () => this.carregar();
      this.socket.onerror = () => this.polling();
      this.socket.onclose = () => this.polling();
      setTimeout(() => { if (this.socket?.readyState !== WebSocket.OPEN) this.polling(); }, 2500);
    } catch { this.polling(); }
  }

  polling(): void {
    if (!this.timer) this.timer = setInterval(() => this.carregar(), 4000);
  }

  carregar(): void {
    this.api.mensagensConversa(this.conversaId).subscribe({
      next: lista => this.mensagens.set(lista),
      error: e => this.erro.set(msgErro(e))
    });
  }

  enviar(): void {
    const conteudo = this.texto.trim();
    if (!conteudo || !this.conversaId) return;
    this.api.enviarMensagem(this.conversaId, conteudo).subscribe({
      next: () => { this.texto = ''; this.carregar(); },
      error: e => this.erro.set(msgErro(e))
    });
  }
}
