import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { msgErro } from '../core/util';

@Component({
  selector: 'app-mensagens',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <section class="container pagina inbox">
      <h1>Minhas mensagens</h1>
      <p class="muted">Conversas iniciadas por responsáveis interessados no seu perfil.</p>

      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

      @if (conversas().length === 0) {
        <div class="caixa vazio">
          <h2>Nenhuma mensagem por enquanto</h2>
          <p class="muted">Quando um responsável entrar em contato, a conversa aparecerá aqui.</p>
        </div>
      } @else {
        <div class="lista">
          @for (c of conversas(); track c.id) {
            <a class="caixa conversa" [routerLink]="['/mensagens', c.id]">
              <div class="topo">
                <strong>{{ c.responsavel }}</strong>
                @if (c.naoLidas > 0) { <span class="contador">{{ c.naoLidas }} não lida(s)</span> }
              </div>
              <p>{{ c.ultimaMensagem || 'Conversa iniciada' }}</p>
              <small class="muted">{{ c.ultimaMensagemEm | date:'dd/MM/yyyy HH:mm' }}</small>
            </a>
          }
        </div>
      }
      <p class="voltar"><a routerLink="/painel">Voltar ao painel</a></p>
    </section>
  `,
  styles: [`
    .inbox { max-width: 850px; }
    .lista { display:grid; gap:12px; margin-top:22px; }
    .conversa { display:block; color:inherit; text-decoration:none; padding:18px; border-radius:14px; transition:transform .15s, box-shadow .15s; }
    .conversa:hover { transform:translateY(-2px); box-shadow:0 5px 18px #00000012; }
    .topo { display:flex; justify-content:space-between; align-items:center; gap:12px; }
    .conversa p { margin:10px 0 6px; overflow-wrap:anywhere; }
    .contador { background:#f5e7e2; color:#75483d; padding:4px 9px; border-radius:20px; font-size:.8rem; font-weight:700; }
    .vazio { margin-top:22px; padding:24px; }
    .voltar { margin-top:24px; }
  `]
})
export class MensagensComponent implements OnInit {
  private api = inject(ApiService);
  conversas = signal<any[]>([]);
  erro = signal('');

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.api.minhasConversas().subscribe({
      next: lista => this.conversas.set(lista),
      error: e => this.erro.set(msgErro(e))
    });
  }
}
