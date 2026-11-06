import { Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Baba, Confianca } from '../core/models';
import { iniciais } from '../core/util';

@Component({
  selector: 'app-baba-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DecimalPipe],
  template: `
    <article class="cracha">
      <div class="topo-cracha">
        <div [class]="'foto cor-' + (baba().id % 4)" aria-hidden="true">{{ ini() }}</div>
        <div>
          <h3>{{ baba().nome }}</h3>
          <p class="local">{{ baba().cidade }}, {{ baba().estado }}</p>
        </div>
        @if (conf(); as c) {
          <div class="anel" [style.--p]="c.score" role="img" [attr.aria-label]="'Índice de confiança ' + c.score + ' de 100'">
            <div class="disco"><b>{{ c.score }}</b></div>
            confiança
          </div>
        }
      </div>

      <p class="bio">{{ baba().descricao || 'Profissional disponível para cuidar com carinho e responsabilidade.' }}</p>

      <div class="selos">
        @if (baba().verificada) {
          <span class="selo">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Perfil verificado
          </span>
        } @else {
          <span class="chip">Verificação em análise</span>
        }
        @for (s of selos(); track s) { <span class="chip">{{ s }}</span> }
      </div>

      @if (conf(); as c) {
        <details class="conf">
          <summary>Por que {{ c.score }}? ({{ c.nivel }})</summary>
          @for (i of c.itens; track i.nome) {
            <div class="conf-linha"><span>{{ i.nome }}</span><b>{{ i.pontos }}/{{ i.max }}</b></div>
          }
        </details>
      }

      <div class="rodape-cracha">
        <div>
          <strong>{{ baba().valorHora | currency: 'BRL' }} por hora</strong><br>
          <span class="muted">Nota {{ baba().notaMedia | number: '1.1-1' }}, {{ baba().experienciaAnos || 0 }} anos</span>
        </div>
        <div style="display:flex;gap:.5rem;align-items:center">
          @if (mostrarFavorito()) {
            <button type="button" class="fav" [attr.aria-pressed]="favorito()" aria-label="Favoritar" (click)="alternar.emit(baba().id)">
              {{ favorito() ? '♥' : '♡' }}
            </button>
          }
          <a class="btn pequeno" [routerLink]="['/babas', baba().id]">Ver perfil</a>
        </div>
      </div>
    </article>
  `,
})
export class BabaCardComponent {
  baba = input.required<Baba>();
  conf = input<Confianca | undefined>();
  favorito = input(false);
  mostrarFavorito = input(false);
  alternar = output<number>();

  ini = computed(() => iniciais(this.baba().nome));
  selos = computed(() => this.conf()?.selos ?? []);
}
