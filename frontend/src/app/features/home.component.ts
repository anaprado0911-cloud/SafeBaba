import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container hero">
      <div>
        <h1>Uma babá em quem você pode confiar, perto de casa.</h1>
        <p class="lead">
          Cada babá tem um Índice de Confiança de 0 a 100 que mostra, item por item, de onde vem a nota.
          O responsável acompanha a chegada, o diário e o pagamento em tempo real.
        </p>
        <form class="busca-rapida" (ngSubmit)="buscar()">
          <label class="sr-only" for="cidade">Cidade</label>
          <input id="cidade" name="cidade" type="text" [(ngModel)]="cidade" placeholder="Em qual cidade você procura?" autocomplete="address-level2">
          <button type="submit" class="btn sol">Buscar babás</button>
        </form>
        <p class="muted">Precisa de alguém hoje? <a routerLink="/agora">Preciso agora</a>. Você é babá? <a routerLink="/cadastro" [queryParams]="{ tipo: 'BABA' }">Crie seu perfil</a>.</p>
      </div>

      <div class="hero-arte" aria-hidden="true">

  <div class="ursinhos-ilustracao" role="presentation">

    <img
  src="assets/images/home-ursinhos.png"
  alt="Ursinhos"
  class="imagem-home"
>

  </div>

  <article class="cracha">

    <div class="topo-cracha">

      <div class="foto cor-1">H</div>

      <div>
        <h3>Helena D.</h3>
        <p class="local">São Paulo, SP</p>
      </div>

      <div class="anel" style="--p: 92">
        <div class="disco">
          <b>92</b>
        </div>
        confiança
      </div>

    </div>

    <p class="bio">
      Pedagoga, 9 anos cuidando de bebês e crianças em idade escolar.
    </p>

    <div class="chips">
      <span class="chip">Primeiros socorros</span>
      <span class="chip">Pontual</span>
    </div>

    <div class="rodape-cracha">
      <strong>Exemplo de perfil</strong>
    </div>

  </article>

  <span class="carimbo">Verificada</span>

</div>
    </section>

    <section class="faixa como-melhor" aria-labelledby="como">
      <div class="container secao-dupla">
        <div class="secao-visual">
          <div class="visual-card">
           <span class="visual-icone" aria-hidden="true"></span>
            <h3>Do primeiro contato ao atendimento</h3>
            <p>Você sabe o que acontece em cada etapa, sem telas confusas.</p>
            <div class="mini-fluxo">
              <span>Perfil</span><b>→</b><span>Agendamento</span><b>→</b><span>Chegada</span><b>→</b><span>Acompanhamento</span>
            </div>
          </div>
        </div>
        <div class="secao-conteudo">
          <span class="eyebrow">SIMPLES E TRANSPARENTE</span>
          <h2 id="como">Como funciona</h2>
          <ol class="passos">
            <li><span class="n">1</span><div><strong>Compare perfis</strong><p>Veja experiência, avaliações, certificados e Índice de Confiança.</p></div></li>
            <li><span class="n">2</span><div><strong>Agende ou chame agora</strong><p>A babá aceita ou recusa e você acompanha o status.</p></div></li>
            <li><span class="n">3</span><div><strong>Confirme a chegada</strong><p>Use um código de 6 dígitos ou QR Code para registrar o check-in.</p></div></li>
            <li><span class="n">4</span><div><strong>Acompanhe e avalie</strong><p>Diário ao vivo, SOS, pagamento no fim e avaliação guiada.</p></div></li>
          </ol>
        </div>
      </div>
    </section>

    <section class="container confianca confianca-melhor" aria-labelledby="seg">
      <div class="secao-dupla">
        <div class="secao-conteudo">
          <span class="eyebrow">SEGURANÇA VISÍVEL</span>
          <h2 id="seg">Segurança que dá para ver</h2>
          <p class="lead">Cada recurso foi pensado para reduzir dúvidas e deixar os principais momentos registrados.</p>
          <div class="seg-cards">

  <article>
    <span class="seg-icone" aria-hidden="true">✓</span>
    <div>
      <h3>Perfil verificado</h3>
      <p>Os documentos da babá passam por análise antes da liberação do perfil.</p>
    </div>
  </article>

  <article>
    <span class="seg-icone" aria-hidden="true">●</span>
    <div>
      <h3>Índice de confiança</h3>
      <p>O responsável consegue entender os principais fatores que formam a pontuação.</p>
    </div>
  </article>

  <article>
    <span class="seg-icone" aria-hidden="true">✓</span>
    <div>
      <h3>Chegada registrada</h3>
      <p>O check-in confirma o início do atendimento e mantém o registro da ocorrência.</p>
    </div>
  </article>

  <article>
    <span class="seg-icone" aria-hidden="true">!</span>
    <div>
      <h3>Proteção durante o atendimento</h3>
      <p>Recursos de emergência ajudam a registrar situações que exigem atenção.</p>
    </div>
  </article>

</div>
        </div>
        <div class="seguranca-painel">
          <div class="painel-top"><span class="dot"></span><span class="dot"></span><span class="dot"></span><b>SafeBabá • proteção em cada etapa</b></div>
          <div class="check-grande">✓</div>
          <h3>Tudo registrado</h3>
          <p>Chegada, diário, mensagens, pagamento e avaliação ficam organizados no atendimento.</p>
          <div class="linha-seguranca"><span>Identidade</span><b>Verificada</b></div>
          <div class="linha-seguranca"><span>Chegada</span><b>Registrada</b></div>
          <div class="linha-seguranca"><span>Atendimento</span><b>Ao vivo</b></div>
        </div>
      </div>
    </section>

    <section class="container convite caixa">
      <h2>Pronta para ser encontrada?</h2>
      <a routerLink="/cadastro" [queryParams]="{ tipo: 'BABA' }" class="btn sol">Criar perfil de babá</a>
    </section>
  `,

  styles: [`
  .eyebrow {
    display: inline-block;
    font-size: .75rem;
    font-weight: 800;
    letter-spacing: .12em;
    color: var(--verde, #39735a);
    margin-bottom: .6rem;
  }

  .secao-dupla {
    display: grid;
    grid-template-columns: .9fr 1.1fr;
    gap: 3rem;
    align-items: center;
    width: 100%;
  }

  /* =========================
   ILUSTRAÇÃO PRINCIPAL
   ========================= */

.imagem-home {
  display: block;
  width: 100%;
  max-width: 360px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 12px rgba(117, 74, 59, .10));
  position: relative;
  z-index: 1;
}

  /* =========================
     COMO FUNCIONA
     ========================= */


  .como-melhor {
  padding: 5rem 0;

  background: #FFF3D6;

  border-top: 1px solid #E8CF91;
  border-bottom: 1px solid #E8CF91;
}


  .secao-visual {
    min-height: 360px;
    display: grid;
    place-items: center;
  }

  .visual-card {
  width: min(420px, 100%);
  background: linear-gradient(145deg, #fffdf9, #f4f8f4);
  border: 1px solid #e0e8e1;
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 18px 45px rgba(35, 72, 51, .10);
  position: relative;
  overflow: hidden;
}

.visual-card::before {
  content: "";
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #fce8d8;
  top: -55px;
  right: -45px;
  opacity: .75;
}

.visual-card::after {
  content: "";
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e4f0e7;
  bottom: -35px;
  left: -25px;
  opacity: .8;
}

.visual-icone {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: #fce8d8;
  color: #a45f43;
  font-size: 2rem;
  font-weight: 900;
  position: relative;
  z-index: 1;
}

.visual-card h3 {
  font-size: 1.45rem;
  margin: 1rem 0 .6rem;
  position: relative;
  z-index: 1;
}

.visual-card p {
  color: #607067;
  line-height: 1.55;
  position: relative;
  z-index: 1;
}

.mini-fluxo {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: .35rem;
  margin-top: 2rem;
  font-size: .72rem;
  position: relative;
  z-index: 1;
}

.mini-fluxo span {
  background: #fff;
  border: 1px solid #dce7df;
  padding: .65rem .4rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 700;
  color: #5a4036;
  box-shadow: 0 3px 8px rgba(35, 72, 51, .05);
}

.mini-fluxo b {
  color: #39735a;
  font-size: 1rem;
}

  .passos {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
    display: grid;
    gap: 1rem;
  }

  .passos li {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: .9rem 1rem;
    border-radius: 14px;
    transition: transform .2s ease, background .2s ease;
  }

  .passos li:hover {
    background: #fff9f1;
    transform: translateX(4px);
  }

.passos .n {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(80, 70, 60, .12);
}

/* 1 — Verde menta */
.passos li:nth-child(1) .n {
  background: #B9D8C0;
  border: 2px solid #82B58D;
  color: #39735A;
}

/* 2 — Pêssego */
.passos li:nth-child(2) .n {
  background: #FCE8D8;
  border: 2px solid #D99F82;
  color: #A45F43;
}

/* 3 — Azul claro */
.passos li:nth-child(3) .n {
  background: #E8EEF8;
  border: 2px solid #9BAFD0;
  color: #48658A;
}

/* 4 — Rosa claro */
.passos li:nth-child(4) .n {
  background: #F8E5E5;
  border: 2px solid #D69A9A;
  color: #A14D4D;
}

  .passos strong {
    font-size: 1rem;
  }

  .passos p {
    margin: .25rem 0 0;
    color: #68766e;
    line-height: 1.45;
  }
    

  /* =========================
     SEGURANÇA
     ========================= */

    .confianca-melhor {
  width: 100%;
  max-width: none;
  box-sizing: border-box;

  display: block !important;

  margin: 0;

  padding: 5rem max(1.5rem, calc((100vw - 1200px) / 2));

  border-radius: 0;

  background: #EEF6F0;

  border-top: 1px solid #D4E4D8;
  border-bottom: 1px solid #D4E4D8;

  box-shadow: none;
}

.confianca-melhor {
  width: 100%;
  max-width: none;
  box-sizing: border-box;

  display: block !important;

  margin: 0 0 3.5rem 0;

  padding: 5rem max(1.5rem, calc((100vw - 1200px) / 2));

  border-radius: 0;

  background: #EEF6F0;

  border-top: 1px solid #D4E4D8;
  border-bottom: 1px solid #D4E4D8;

  box-shadow: none;
}

  .confianca-melhor > .secao-dupla {
    display: grid;
    width: 100%;
    grid-template-columns: 1.15fr .85fr;
    gap: 3rem;
    align-items: center;
  }

  .seg-cards {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .9rem;
    margin-top: 1.5rem;
  }

  .seg-cards article {
    display: flex;
    gap: .8rem;
    padding: 1.1rem;
    border: 1px solid #e0e7e2;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 5px 18px rgba(35, 72, 51, .05);
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .seg-cards article:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(35, 72, 51, .09);
  }

  .seg-cards article > span {
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #e8f3eb;
    color: #B9D8C0;
    font-size: 1.15rem;
    font-weight: 900;
  }

  .seg-cards article:nth-child(2) > span {
    background: #fce8d8;
    color: #754a3b;
  }

  .seg-cards article:nth-child(3) > span {
    background: #e8eef8;
    color: #48658a;
  }

  .seg-cards article:nth-child(4) > span {
    background: #f8e5e5;
    color: #a14d4d;
  }

  .seg-cards h3 {
    font-size: 1rem;
    margin: 0;
  }

  .seg-cards p {
    font-size: .86rem;
    color: #6b756f;
    line-height: 1.45;
    margin: .3rem 0 0;
  }

/* =========================
   PAINEL DA DIREITA
   ========================= */

.seguranca-painel {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(145deg, #3F6B5A, #527D6A);
  color: #FFF9F2;
  border-radius: 26px;
  padding: 1.7rem;
  box-shadow: 0 18px 45px rgba(63, 107, 90, .18);
  position: relative;
  overflow: hidden;
}

.seguranca-painel::after {
  content: "✓";
  position: absolute;
  right: -15px;
  bottom: -35px;
  font-size: 11rem;
  font-weight: 900;
  color: rgba(255, 255, 255, .05);
  line-height: 1;
}

.painel-top {
  display: flex;
  align-items: center;
  gap: .35rem;
  font-size: .7rem;
  color: #E8F2EB;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.painel-top b {
  margin-left: auto;
  font-weight: 600;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #B9D8C0;
}

.check-grande {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #B9D8C0;
  color: #315044;
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 1rem;
  box-shadow: 0 0 0 8px rgba(185, 216, 192, .15);
  position: relative;
  z-index: 1;
}

.seguranca-painel h3 {
  font-size: 1.5rem;
  margin: .3rem 0;
  position: relative;
  z-index: 1;
}

.seguranca-painel > p {
  color: #E8F2EB;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.linha-seguranca {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .85rem 0;
  border-top: 1px solid rgba(255,255,255,.16);
  color: #F5FAF7;
  position: relative;
  z-index: 1;
}

.linha-seguranca b {
  color: #B9D8C0;
  font-size: .9rem;
}

 /* =========================
     RESPONSIVO
     ========================= */

  @media(max-width:800px) {

    .secao-dupla {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .como-melhor {
      padding: 3rem 0;
    }

    .confianca-melhor {
      display: block !important;
      padding-top: 3rem;
      padding-bottom: 3rem;
    }

    .confianca-melhor > .secao-dupla {
      grid-template-columns: 1fr;
    }

    .seg-cards {
      grid-template-columns: 1fr;
    }

    .mini-fluxo {
      grid-template-columns: 1fr 1fr;
      gap: .5rem;
    }

    .mini-fluxo b {
      display: none;
    }
      
  }

  
`],

})
export class HomeComponent {
  private router = inject(Router);
  cidade = '';

  buscar() {
    const cidade = this.cidade.trim();
    this.router.navigate(['/babas'], { queryParams: cidade ? { cidade } : {} });
  }
}
