import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Agendamento } from '../core/models';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container pagina">
      <h1>Olá, {{ primeiroNome() }}</h1>

      <p class="muted">
        {{ auth.sessao()?.email }}, conta de {{ rotuloTipo() }}
      </p>

      @if (auth.tipo() !== 'ADMIN') {
        <div class="numeros">
          <div class="caixa numero">
            <b>{{ pendentes() }}</b>
            {{ auth.tipo() === 'BABA'
              ? 'solicitações para responder'
              : 'aguardando resposta' }}
          </div>

          <div class="caixa numero">
            <b>{{ proximos() }}</b>
            atendimentos aceitos
          </div>

          @if (auth.tipo() === 'PAI') {
            <div class="caixa numero">
              <b>{{ favoritos() }}</b>
              babás favoritas
            </div>
          }
        </div>
      }

      <h2>Atalhos</h2>

      <div class="acoes-linha">

        <!-- ========================= -->
        <!-- ATALHOS DO RESPONSÁVEL    -->
        <!-- ========================= -->

        @if (auth.tipo() === 'PAI') {
          <a class="btn sol" routerLink="/agora">
            Preciso de uma babá agora
          </a>

          <a class="btn" routerLink="/babas">
            Encontrar babá
          </a>

          <a class="btn vazio" routerLink="/criancas">
            Cartão de cuidados
          </a>

          <a class="btn vazio" routerLink="/assinatura">
            Plano da família
          </a>

          <a class="btn vazio" routerLink="/pagamentos">
            Meus pagamentos
          </a>

          <a class="btn vazio" routerLink="/agenda">
            Minha agenda
          </a>
        }


        <!-- ========================= -->
        <!-- ATALHOS DA BABÁ           -->
        <!-- ========================= -->

        @if (auth.tipo() === 'BABA') {

          <div class="atendimento-imediato">
            <div class="caixa">
              <h3>Atendimento imediato</h3>

              <p class="muted">
                Ative quando puder receber novas solicitações urgentes.
                Você pode desativar a qualquer momento.
              </p>

              <label class="disponibilidade-label">
                <input
                  type="checkbox"
                  [checked]="disponivelAgora()"
                  (change)="alternarDisponibilidade($any($event.target).checked)"
                  [disabled]="salvandoDisponibilidade()"
                >

                <span>
                  Estou disponível para atendimento imediato
                </span>
              </label>

              @if (mensagemDisponibilidade()) {
                <p class="ajuda" role="status">
                  {{ mensagemDisponibilidade() }}
                </p>
              }
            </div>
          </div>


          <div class="acoes-baba">

            <a class="btn sol" routerLink="/documentos">
              Enviar documentos
            </a>

            <a class="btn sol" routerLink="/mensagens">
              Minhas mensagens
            </a>

            <a class="btn sol" routerLink="/agenda">
              Responder solicitações
            </a>

            <a class="btn vazio" routerLink="/pagamentos">
              Meus pagamentos
            </a>

            <a class="btn vazio" routerLink="/agenda">
              Minha agenda
            </a>

          </div>
        }


        <!-- ========================= -->
        <!-- ADMINISTRADOR              -->
        <!-- ========================= -->

        @if (auth.tipo() === 'ADMIN') {
          <a class="btn sol" routerLink="/admin">
            Central de moderação
          </a>
        }

      </div>
    </section>
  `,
})
export class PainelComponent implements OnInit {

  private api = inject(ApiService);

  auth = inject(AuthService);

  agenda = signal<Agendamento[]>([]);

  favoritos = signal(0);

  disponivelAgora = signal(false);

  salvandoDisponibilidade = signal(false);

  mensagemDisponibilidade = signal('');


  primeiroNome = computed(() =>
    (this.auth.sessao()?.nome ?? '').split(' ')[0]
  );


  rotuloTipo = computed(() =>
    ({
      PAI: 'responsável',
      BABA: 'babá',
      ADMIN: 'administrador'
    }[this.auth.tipo() ?? 'PAI'])
  );


  pendentes = computed(() =>
    this.agenda().filter(
      (a) => a.status === 'PENDENTE'
    ).length
  );


  proximos = computed(() =>
    this.agenda().filter(
      (a) => a.status === 'ACEITO'
    ).length
  );


  alternarDisponibilidade(valor: boolean) {

    if (
      valor &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }

    this.salvandoDisponibilidade.set(true);

    this.mensagemDisponibilidade.set('');


    this.api.alterarDisponibilidade(valor).subscribe({

      next: (r) => {

        this.disponivelAgora.set(r.disponivelAgora);

        this.mensagemDisponibilidade.set(
          r.disponivelAgora
            ? 'Disponibilidade ativada. Compartilhe sua localização para aparecer por proximidade.'
            : 'Você não aparecerá nas buscas urgentes.'
        );

        this.salvandoDisponibilidade.set(false);


        if (r.disponivelAgora) {
          this.atualizarGps();
        }
      },


      error: () => {

        this.mensagemDisponibilidade.set(
          'Não foi possível salvar. Tente novamente.'
        );

        this.salvandoDisponibilidade.set(false);
      },

    });
  }


  private atualizarGps() {

    if (!navigator.geolocation) {

      this.mensagemDisponibilidade.set(
        'Seu navegador não oferece localização. Você ainda aparecerá pela cidade cadastrada.'
      );

      return;
    }


    navigator.geolocation.getCurrentPosition(

      (pos) => {

        this.api
          .atualizarMinhaLocalizacao(
            pos.coords.latitude,
            pos.coords.longitude
          )
          .subscribe({

            next: () => {

              this.mensagemDisponibilidade.set(
                'Disponível e localização atualizada.'
              );
            },


            error: () => {

              this.mensagemDisponibilidade.set(
                'Disponível, mas não foi possível salvar a localização.'
              );
            },

          });
      },


      () => {

        this.mensagemDisponibilidade.set(
          'Permita a localização no navegador para aparecer por proximidade. Você continuará aparecendo pela cidade.'
        );
      },


      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }

    );
  }


  ngOnInit() {

    if (this.auth.tipo() === 'ADMIN') {
      return;
    }


    this.api.minhaAgenda().subscribe({

      next: (lista) => {
        this.agenda.set(lista);
      },


      error: () => {
        this.agenda.set([]);
      },

    });


    if (this.auth.tipo() === 'BABA') {

      this.api.minhaDisponibilidade().subscribe({

        next: (r) => {
          this.disponivelAgora.set(r.disponivelAgora);
        },


        error: () => {

          this.mensagemDisponibilidade.set(
            'Não foi possível consultar sua disponibilidade.'
          );
        },

      });
    }


    if (this.auth.tipo() === 'PAI') {

      this.api.favoritos().subscribe({

        next: (f) => {
          this.favoritos.set(f.length);
        },


        error: () => {
          // opcional
        },

      });
    }
  }
}