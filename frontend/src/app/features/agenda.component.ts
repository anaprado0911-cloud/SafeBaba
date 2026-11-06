import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Agendamento, StatusAgendamento } from '../core/models';
import { ROTULO_STATUS, msgErro } from '../core/util';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <section class="container pagina">
      <h1>{{ auth.tipo() === 'BABA' ? 'Solicitações e agenda' : 'Minha agenda' }}</h1>
      @if (auth.tipo() === 'BABA') { <p><a class="btn pequeno vazio" routerLink="/disponibilidade">Configurar horários e folgas</a></p> }
      @if (auth.tipo() === 'BABA') { <p class="muted">Novas solicitações são verificadas automaticamente a cada 8 segundos enquanto esta tela estiver aberta. Permita notificações no navegador para receber avisos na tela.</p> }
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

      @if (carregando()) { <div class="esqueleto" style="height:140px"></div> }
      @else if (lista().length === 0) {
        <div class="vazio-estado caixa">
          <p>Nenhum agendamento por enquanto.</p>
          @if (auth.tipo() === 'PAI') { <a class="btn" routerLink="/babas">Encontrar babá</a> }
        </div>
      }

      @for (a of lista(); track a.id) {
        <article class="caixa solic">
          <div class="linha">
            <h3 style="margin:0">{{ auth.tipo() === 'PAI' ? a.babaNome : 'Atendimento #' + a.id }}</h3>
            <span [class]="'status ' + (a.status === 'ACEITO' ? 'ACEITA' : a.status === 'CONCLUIDO' ? 'CONCLUIDA' : a.status === 'RECUSADO' || a.status === 'CANCELADO' ? 'RECUSADA' : 'PENDENTE')">{{ rotulo[a.status] }}</span>
          </div>
          <p style="margin:0">{{ a.dataServico | date: 'dd/MM/yyyy' }}, das {{ a.horaInicio.slice(0, 5) }} às {{ a.horaFim.slice(0, 5) }}</p>
          <p class="muted" style="margin:0">{{ a.endereco }}, {{ a.quantidadeCriancas }} {{ a.quantidadeCriancas === 1 ? 'criança' : 'crianças' }}</p>
          @if (a.observacoes) { <p class="muted" style="margin:0">{{ a.observacoes }}</p> }

          <div class="botoes">
            @if (auth.tipo() === 'BABA' && a.status === 'PENDENTE') {
              <button type="button" class="btn pequeno" (click)="mudar(a, 'ACEITO')">Aceitar</button>
              <button type="button" class="btn pequeno vazio" (click)="mudar(a, 'RECUSADO')">Recusar</button>
            }
            @if (auth.tipo() === 'PAI' && (a.status === 'PENDENTE' || a.status === 'ACEITO')) {
              <button type="button" class="btn pequeno vazio" (click)="mudar(a, 'CANCELADO')">Cancelar</button>
            }
            @if (a.status === 'ACEITO' || a.status === 'CONCLUIDO') {
              <a class="btn pequeno sol" [routerLink]="['/atendimento', a.id]">Abrir acompanhamento</a>
            }
          </div>
        </article>
      }
    </section>
  `,
})
export class AgendaComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  auth = inject(AuthService);
  readonly rotulo = ROTULO_STATUS;

  lista = signal<Agendamento[]>([]);
  carregando = signal(true);
  erro = signal('');
  private intervalo: ReturnType<typeof setInterval> | null = null;
  private idsConhecidos = new Set<number>();

  ngOnInit() {
    this.carregar(true);
    if (this.auth.tipo() === 'BABA') this.intervalo = setInterval(() => this.carregar(false), 8000);
  }
  ngOnDestroy() { if (this.intervalo) clearInterval(this.intervalo); }

  private carregar(inicial: boolean) {
    this.api.minhaAgenda().subscribe({
      next: (l) => {
        if (this.auth.tipo() === 'BABA' && !inicial) {
          l.filter(a => a.status === 'PENDENTE' && (a.observacoes || '').includes('URGENTE') && !this.idsConhecidos.has(a.id)).forEach(a => {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification('Nova solicitação urgente – SafeBaba', { body: `Responsável solicitou atendimento. Endereço: ${a.endereco}` });
          });
        }
        this.idsConhecidos = new Set(l.filter(a => a.status === 'PENDENTE').map(a => a.id));
        this.lista.set(l); this.carregando.set(false);
      },
      error: (e) => { this.erro.set(msgErro(e)); this.carregando.set(false); },
    });
  }

  mudar(a: Agendamento, valor: StatusAgendamento) {
    this.erro.set('');
    this.api.mudarStatus(a.id, valor).subscribe({ next: () => this.carregar(false), error: (e) => this.erro.set(msgErro(e)) });
  }
}
