import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Pagamento } from '../core/models';
import { msgErro } from '../core/util';

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink],
  template: `
    <section class="container pagina">
      <h1>Meus pagamentos</h1>
      <p class="muted">{{ auth.tipo() === 'BABA' ? 'Acompanhe os valores dos seus atendimentos.' : 'Consulte os pagamentos dos seus atendimentos.' }}</p>
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }
      @if (carregando()) {
        <div class="esqueleto" style="height:120px"></div>
      } @else {
        <div class="numeros">
          <div class="caixa numero">
            <b>{{ totalRetido() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</b>
            Valores retidos
          </div>
          @if (auth.tipo() === 'BABA') {
            <div class="caixa numero">
              <b>{{ totalLiberado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</b>
              Valores liberados
            </div>
          }
        </div>
        @if (lista().length === 0) {
          <div class="vazio-estado caixa">
            <p>Nenhum pagamento registrado ainda.</p>
            <a class="btn vazio" routerLink="/agenda">Ver minha agenda</a>
          </div>
        } @else {
          <h2>Histórico</h2>
          @for (p of lista(); track p.id) {
            <article class="caixa solic">
              <div class="linha">
                <h3 style="margin:0">Atendimento #{{ p.agendamentoId }}</h3>
                <span [class]="'status ' + (p.status === 'LIBERADO' ? 'ACEITA' : 'PENDENTE')">
                  {{ p.status === 'LIBERADO' ? 'Liberado' : 'Retido' }}
                </span>
              </div>
              <p style="margin:.5rem 0"><b>{{ p.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</b></p>
              <p class="muted" style="margin:0">{{ auth.tipo() === 'BABA' ? 'Responsável: ' + p.responsavelNome : 'Babá: ' + p.babaNome }}</p>
              <p class="muted" style="margin:.25rem 0">Atendimento: {{ p.dataServico | date:'dd/MM/yyyy' }}, {{ p.horaInicio.slice(0,5) }} às {{ p.horaFim.slice(0,5) }}</p>
              <p class="muted" style="margin:.25rem 0">Registro do pagamento: {{ p.criadoEm | date:'dd/MM/yyyy HH:mm' }}</p>
              @if (p.status === 'RETIDO') {
                <p class="muted" style="margin:.5rem 0 0">O valor será marcado como liberado quando a babá encerrar o atendimento.</p>
              }
            </article>
          }
        }
      }
      <p><a routerLink="/agenda">Voltar para a agenda</a></p>
    </section>
  `,
})
export class PagamentosComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  lista = signal<Pagamento[]>([]);
  carregando = signal(true);
  erro = signal('');

  totalRetido = computed(() => this.lista().filter(p => p.status === 'RETIDO').reduce((s, p) => s + p.valor, 0));
  totalLiberado = computed(() => this.lista().filter(p => p.status === 'LIBERADO').reduce((s, p) => s + p.valor, 0));

  ngOnInit() {
    this.api.meusPagamentos().subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(msgErro(e)); this.carregando.set(false); },
    });
  }
}
