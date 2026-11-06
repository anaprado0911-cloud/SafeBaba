import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { NotifService } from '../core/notif.service';
import { Notificacao } from '../core/models';
import { ROTULO_EVENTO, msgErro } from '../core/util';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <section class="estreita pagina">
      <h1>Notificações</h1>
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }
      @if (lista().length === 0 && !erro()) { <div class="caixa"><p style="margin:0">Nada novo por aqui.</p></div> }
      @for (n of lista(); track $index) {
        <article class="caixa solic">
          <div class="linha">
            <strong>{{ rotulo[n.tipo] || n.tipo }}</strong>
            <small class="muted">{{ n.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</small>
          </div>
          @if (n.texto) { <p style="margin:0">{{ n.texto }}</p> }
          <a [routerLink]="['/atendimento', n.agendamentoId]">Abrir atendimento</a>
        </article>
      }
    </section>
  `,
})
export class NotificacoesComponent implements OnInit {
  private api = inject(ApiService);
  private notif = inject(NotifService);
  readonly rotulo = ROTULO_EVENTO;

  lista = signal<Notificacao[]>([]);
  erro = signal('');

  ngOnInit() {
    this.api.notificacoes().subscribe({
      next: (l) => { this.lista.set(l); this.notif.marcarVistas(); },
      error: (e) => this.erro.set(msgErro(e)),
    });
  }
}
