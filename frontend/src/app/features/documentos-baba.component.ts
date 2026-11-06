import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { msgErro } from '../core/util';

@Component({
  selector: 'app-documentos-baba',
  standalone: true,
  imports: [FormsModule],
  template: `

    <section class="container pagina">

      <div class="pagina-cabecalho">

        <div>
          <span class="eyebrow">VERIFICAÇÃO DE PERFIL</span>

          <h1>Envie seus documentos</h1>

          <p class="lead">
            Uma etapa simples para deixar seu perfil mais confiável para as famílias.
          </p>
        </div>

        <span class="selo-seguranca">
          <span class="selo-icone" aria-hidden="true"></span>
          Dados protegidos
        </span>

      </div>


      @if (erro()) {
        <div class="aviso erro" role="alert">
          {{ erro() }}
        </div>
      }

      @if (sucesso()) {
        <div class="aviso sucesso" role="status">
          {{ sucesso() }}
        </div>
      }


      <div class="documentos-grid">

        <!-- CARD DE ENVIO -->
        <div class="caixa documento-form">

          <div class="progresso-doc">
            <span class="passo ativo">1</span>
            <span class="linha-passo"></span>
            <span class="passo">2</span>
            <span class="linha-passo"></span>
            <span class="passo">3</span>
          </div>

          <h2>Documento de identificação</h2>

          <p class="muted">
            Escolha o documento e envie uma foto legível ou um PDF.
            O arquivo será analisado pela equipe de moderação.
          </p>


          <div class="campo">

            <label for="tipoDoc">
              Tipo de documento
            </label>

            <select id="tipoDoc" [(ngModel)]="tipo">
              <option value="RG">RG</option>
              <option value="CNH">CNH</option>
              <option value="CPF">CPF</option>
              <option value="CERTIFICADO">Certificado</option>
            </select>

          </div>


          <!-- ÁREA DE UPLOAD -->
          <label class="upload-area" for="arquivo">

            <span class="upload-icone" aria-hidden="true"></span>

            <strong>
              {{ arquivoNome || 'Clique para selecionar o arquivo' }}
            </strong>

            <small>
              PDF, JPG ou PNG · até 10 MB
            </small>

            <input
              id="arquivo"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              (change)="selecionar($event)"
            >

          </label>


          <!-- ARQUIVO SELECIONADO -->
          @if (arquivo()) {

            <div class="arquivo-selecionado">

              <span
                class="icone-arquivo"
                aria-hidden="true">
              </span>

              <div>
                <b>{{ arquivoNome }}</b>
                <small>{{ tamanhoArquivo() }}</small>
              </div>

              <button
                type="button"
                class="btn-link"
                (click)="limparArquivo()">
                Remover
              </button>

            </div>

          }


          <button
            class="btn sol btn-full"
            type="button"
            [disabled]="!arquivo() || enviando()"
            (click)="enviar()">

            {{ enviando()
              ? 'Enviando documento...'
              : 'Enviar para análise' }}

          </button>

        </div>


        <!-- CARD DE STATUS -->
        <aside class="caixa status-doc">

          <div
            class="status-icone"
            aria-hidden="true">
          </div>

          <h2>Status da verificação</h2>

          <div
            class="status-badge"
            [class.aprovado]="status() === 'APROVADO'"
            [class.reprovado]="status() === 'REPROVADO'">

            {{ statusTexto() }}

          </div>


          @if (dados().nomeArquivo) {

            <p class="arquivo-atual">

              <span
                class="arquivo-atual-icone"
                aria-hidden="true">
              </span>

              {{ dados().nomeArquivo }}

            </p>

          }


          @if (dados().motivoReprovacao) {

            <div class="motivo">

              <strong>
                O que precisa ser corrigido
              </strong>

              <p>
                {{ dados().motivoReprovacao }}
              </p>

            </div>

          }


          <ul class="check-list">

            <li>
              <span class="check-icone" aria-hidden="true"></span>
              Documento legível e sem cortes
            </li>

            <li>
              <span class="check-icone" aria-hidden="true"></span>
              Nome e dados visíveis
            </li>

            <li>
              <span class="check-icone" aria-hidden="true"></span>
              Arquivo dentro do limite de 10 MB
            </li>

            <li>
              <span class="check-icone" aria-hidden="true"></span>
              Análise feita pela equipe SafeBabá
            </li>

          </ul>

        </aside>

      </div>


      <!-- POR QUE PEDIMOS ISSO -->
      
      <div class="caixa privacidade-doc">

  <div
    class="privacidade-icone"
    aria-hidden="true">
  </div>

  <div class="privacidade-conteudo">

    <h3>Por que pedimos isso?</h3>

    <p>
     Queremos tornar a plataforma mais segura para todos. Por isso, solicitamos um documento de identificação para confirmar que o perfil pertence à pessoa cadastrada. O documento é analisado exclusivamente pela equipe SafeBabá e não fica visível para as famílias. Essa etapa ajuda a aumentar a confiança e a segurança na conexão entre babás e famílias.
    </p>

  </div>

</div>

    </section>

  `,

  styles: [`

    /* =====================================================
       PÁGINA
       ===================================================== */

    .pagina {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 2.5rem 2rem 4rem;
      box-sizing: border-box;
    }


    /* =====================================================
       CABEÇALHO
       ===================================================== */

    .pagina-cabecalho {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      margin-bottom: 2.5rem;
      box-sizing: border-box;
    }

    .pagina-cabecalho > div:first-child {
      max-width: 760px;
    }

    .eyebrow {
      margin: 0 0 .5rem;
      font-size: .78rem;
      font-weight: 800;
      letter-spacing: .12em;
      color: #39735a;
      text-transform: uppercase;
    }

    .pagina-cabecalho h1 {
      margin: 0;
      color: #49332e;
      line-height: 1.05;
    }

    .pagina-cabecalho p {
      margin-top: 1rem;
      max-width: 650px;
    }


    /* =====================================================
       SELO DADOS PROTEGIDOS
       ===================================================== */

    .selo-seguranca {
      display: inline-flex;
      align-items: center;
      gap: .65rem;

      background: #eef7f1;
      color: #315c49;

      border: 2px solid #cfe7d8;
      border-radius: 999px;

      padding: .7rem 1.1rem;

      font-weight: 700;
      white-space: nowrap;

      box-sizing: border-box;
    }


    /* Escudo feito somente com CSS */

    .selo-icone {
      width: 16px;
      height: 19px;
      position: relative;
      display: inline-block;
      background: #39735a;

      clip-path: polygon(
        50% 0%,
        92% 16%,
        92% 53%,
        78% 76%,
        50% 100%,
        22% 76%,
        8% 53%,
        8% 16%
      );
    }

    .selo-icone::after {
      content: "";
      position: absolute;

      width: 5px;
      height: 8px;

      left: 5.5px;
      top: 5px;

      border-right: 2px solid #ffffff;
      border-bottom: 2px solid #ffffff;

      transform: rotate(45deg);
    }


    /* =====================================================
       ÁREA PRINCIPAL
       ===================================================== */

    .documentos-grid {
      width: 100%;

      display: grid;

      grid-template-columns:
        minmax(0, 1.55fr)
        minmax(340px, .9fr);

      gap: 2rem;

      align-items: stretch;

      margin: 0;

      box-sizing: border-box;
    }


    /* =====================================================
       CARTÕES
       ===================================================== */

    .documento-form,
    .status-doc {

      width: 100%;
      min-width: 0;

      padding: 1.8rem;

      background: #ffffff;

      border: 2px solid #e3c4b0;

      border-radius: 24px;

      box-shadow:
        0 12px 30px rgba(117, 74, 59, .08);

      box-sizing: border-box;
    }

    .documento-form {
      display: flex;
      flex-direction: column;
    }

    .status-doc {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .documento-form h2,
    .status-doc h2 {
      margin-top: 0;
      color: #49332e;
    }


    /* =====================================================
       ETAPAS
       ===================================================== */

    .progresso-doc {
      width: 100%;

      display: flex;
      align-items: center;

      margin-bottom: 1.5rem;
    }

    .passo {
      width: 34px;
      height: 34px;

      flex: 0 0 34px;

      display: grid;
      place-items: center;

      border-radius: 50%;

      background: #f2eee9;
      color: #777;

      border: 2px solid #dfc4b0;

      font-weight: 800;

      box-sizing: border-box;
    }

    .passo.ativo {
      background: #39735a;
      color: #ffffff;
      border-color: #39735a;
    }

    .linha-passo {
      height: 2px;
      flex: 1;

      background: #ddd4ce;

      margin: 0 .35rem;
    }


    /* =====================================================
       TÍTULO DO DOCUMENTO
       ===================================================== */

    .documento-form h2 {
      margin-bottom: .8rem;
      line-height: 1.15;
    }

    .documento-form > p {
      margin-top: 0;
      line-height: 1.6;
    }


    /* =====================================================
       SELECT
       ===================================================== */

    .documento-form select {
      width: 100%;

      min-height: 48px;

      padding: .7rem .9rem;

      border: 1.5px solid #d9b49b;
      border-radius: 12px;

      background: #ffffff;

      color: #49332e;

      box-sizing: border-box;
    }

    .documento-form select:focus {
      outline: none;

      border-color: #39735a;

      box-shadow:
        0 0 0 3px rgba(57, 115, 90, .12);
    }


    /* =====================================================
       ÁREA DE UPLOAD
       ===================================================== */

    .upload-area {

      width: 100%;
      min-height: 180px;

      margin: 1.2rem 0;

      border: 2px dashed #b8c8bf;
      border-radius: 18px;

      display: flex;
      flex-direction: column;

      align-items: center;
      justify-content: center;

      text-align: center;

      cursor: pointer;

      background: #fafcfb;

      padding: 1.2rem;

      box-sizing: border-box;

      transition:
        border-color .2s ease,
        background .2s ease,
        transform .2s ease;
    }

    .upload-area:hover {
      border-color: #39735a;
      background: #f4faf6;
      transform: translateY(-1px);
    }

    .upload-area input {
      display: none;
    }


    /* Ícone de upload sem emoji */

    .upload-icone {
      width: 28px;
      height: 34px;

      position: relative;

      margin-bottom: .7rem;

      border: 2px solid #39735a;
      border-radius: 5px;

      box-sizing: border-box;
    }

    .upload-icone::before {
      content: "";

      position: absolute;

      width: 9px;
      height: 9px;

      left: 7px;
      top: 10px;

      border-left: 2px solid #39735a;
      border-top: 2px solid #39735a;

      transform: rotate(45deg);
    }

    .upload-icone::after {
      content: "";

      position: absolute;

      width: 2px;
      height: 13px;

      left: 12px;
      top: 8px;

      background: #39735a;
    }

    .upload-area small {
      margin-top: .4rem;

      color: #777;

      line-height: 1.4;
    }


    /* =====================================================
       ARQUIVO SELECIONADO
       ===================================================== */

    .arquivo-selecionado {

      width: 100%;

      display: flex;
      align-items: center;

      gap: .7rem;

      border: 1px solid #ddd2ca;
      border-radius: 12px;

      padding: .8rem;

      margin-bottom: 1rem;

      background: #fffaf7;

      box-sizing: border-box;
    }

    .arquivo-selecionado div {
      display: flex;
      flex-direction: column;

      min-width: 0;
      flex: 1;
    }

    .arquivo-selecionado small {
      color: #777;
      margin-top: .2rem;
    }

    .arquivo-selecionado strong,
    .arquivo-selecionado b {
      word-break: break-word;
    }


    /* Ícone de arquivo sem emoji */

    .icone-arquivo {

      width: 30px;
      height: 36px;

      flex: 0 0 30px;

      position: relative;

      background: #f3eadf;

      border: 2px solid #c9aa92;
      border-radius: 5px;

      box-sizing: border-box;
    }

    .icone-arquivo::before {

      content: "";

      position: absolute;

      top: -2px;
      right: -2px;

      width: 10px;
      height: 10px;

      background: #ffffff;

      border-left: 2px solid #c9aa92;
      border-bottom: 2px solid #c9aa92;

      transform: rotate(45deg);
    }

    .icone-arquivo::after {

      content: "";

      position: absolute;

      left: 6px;
      top: 12px;

      width: 14px;
      height: 2px;

      background: #9b806b;

      box-shadow:
        0 6px 0 #9b806b,
        0 12px 0 #9b806b;
    }


    /* =====================================================
       BOTÃO REMOVER
       ===================================================== */

    .btn-link {

      flex: 0 0 auto;

      background: none;
      border: 0;

      color: #39735a;

      text-decoration: underline;

      cursor: pointer;

      padding: .3rem;
    }

    .btn-full {
      width: 100%;
      box-sizing: border-box;
    }


    /* =====================================================
       STATUS DA VERIFICAÇÃO
       ===================================================== */

    .status-doc {
      text-align: left;
    }


    /* Documento desenhado em CSS */

    .status-icone {

      width: 42px;
      height: 50px;

      margin: .2rem auto 1rem;

      position: relative;

      background: #e9e2f3;

      border: 2px solid #c9bddb;

      border-radius: 5px;

      box-sizing: border-box;
    }

    .status-icone::before {

      content: "";

      position: absolute;

      top: 8px;
      left: 9px;

      width: 20px;
      height: 2px;

      background: #9b8eae;

      box-shadow:
        0 7px 0 #9b8eae,
        0 14px 0 #9b8eae;
    }

    .status-icone::after {

      content: "";

      position: absolute;

      top: -2px;
      right: -2px;

      width: 13px;
      height: 13px;

      background: #ffffff;

      border-left: 2px solid #c9bddb;
      border-bottom: 2px solid #c9bddb;

      transform: rotate(45deg);
    }

    .status-doc h2 {

      text-align: center;

      margin-bottom: 1rem;

      line-height: 1.15;
    }


    /* =====================================================
       STATUS BADGE
       ===================================================== */

    .status-badge {

      display: table;

      margin: 0 auto 1.2rem;

      background: #fff4d6;

      color: #8a6514;

      padding: .5rem .9rem;

      border-radius: 999px;

      font-weight: 800;
    }

    .status-badge.aprovado {

      background: #e4f5e9;

      color: #287246;
    }

    .status-badge.reprovado {

      background: #fde9e9;

      color: #a33;
    }


    /* =====================================================
       ARQUIVO ATUAL
       ===================================================== */

    .arquivo-atual {

      display: flex;
      align-items: center;
      gap: .6rem;

      word-break: break-word;

      background: #f7faf8;

      border: 1px solid #dbe8df;

      border-radius: 12px;

      padding: .8rem;

      margin-top: .8rem;
    }


    /* Pequeno ícone do arquivo atual */

    .arquivo-atual-icone {

      width: 18px;
      height: 22px;

      flex: 0 0 18px;

      position: relative;

      background: #e7f0ea;

      border: 1px solid #39735a;

      border-radius: 3px;

      box-sizing: border-box;
    }

    .arquivo-atual-icone::after {

      content: "";

      position: absolute;

      left: 4px;
      top: 7px;

      width: 8px;
      height: 1px;

      background: #39735a;

      box-shadow:
        0 4px 0 #39735a,
        0 8px 0 #39735a;
    }


    /* =====================================================
       MOTIVO DA REPROVAÇÃO
       ===================================================== */

    .motivo {

      width: 100%;

      text-align: left;

      background: #fff5f5;

      border: 1px solid #f0d0d0;

      border-radius: 12px;

      padding: .9rem;

      box-sizing: border-box;
    }

    .motivo p {

      margin: .3rem 0 0;

      line-height: 1.5;
    }


    /* =====================================================
       LISTA DE VERIFICAÇÃO
       ===================================================== */

    .check-list {

      text-align: left;

      list-style: none;

      padding: 0;

      margin: 1rem 0 0;

      line-height: 1.8;

      color: #496052;
    }

    .check-list li {

      display: flex;
      align-items: center;

      gap: .55rem;

      margin-bottom: .35rem;
    }


    /* Check sem emoji */

    .check-icone {

      width: 18px;
      height: 18px;

      flex: 0 0 18px;

      position: relative;

      border-radius: 50%;

      background: #39735a;
    }

    .check-icone::after {

      content: "";

      position: absolute;

      width: 5px;
      height: 8px;

      left: 6px;
      top: 3px;

      border-right: 2px solid #ffffff;
      border-bottom: 2px solid #ffffff;

      transform: rotate(45deg);
    }


    /* =====================================================
       POR QUE PEDIMOS ISSO
       ===================================================== */

       .privacidade-doc {
  display: flex !important;
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box;

  align-items: center;
  gap: 1.2rem;

  margin: 1.5rem 0 0;
  padding: 1.5rem 2rem;

  background: #ffffff;
  border: 2px solid #e3c4b0;
  border-radius: 20px;

  box-shadow: 0 8px 22px rgba(117, 74, 59, .06);

  grid-column: 1 / -1;
}

.privacidade-conteudo {
  flex: 1;
  min-width: 0;
}


    /* Escudo de privacidade sem emoji */

    .privacidade-icone {

      width: 28px;
      height: 32px;

      flex: 0 0 28px;

      position: relative;

      background: #39735a;

      clip-path: polygon(
        50% 0%,
        92% 16%,
        92% 53%,
        78% 76%,
        50% 100%,
        22% 76%,
        8% 53%,
        8% 16%
      );
    }

    .privacidade-icone::after {

      content: "";

      position: absolute;

      width: 7px;
      height: 11px;

      left: 9px;
      top: 8px;

      border-right: 2px solid #ffffff;
      border-bottom: 2px solid #ffffff;

      transform: rotate(45deg);
    }

    .privacidade-doc h3 {

      margin: 0 0 .3rem;

      color: #49332e;
    }

    .privacidade-doc p {

      margin: .1rem 0;

      line-height: 1.5;
    }


    /* =====================================================
       CONTAINER
       ===================================================== */

    :host {

      display: block;

      width: 100%;

      box-sizing: border-box;
    }


    /* =====================================================
       TELAS MÉDIAS
       ===================================================== */

    @media (max-width: 1000px) {

      .pagina {

        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }

      .documentos-grid {

        grid-template-columns: 1fr 1fr;

        gap: 1.2rem;
      }

      .documento-form,
      .status-doc {

        padding: 1.4rem;
      }

    }


    /* =====================================================
       CELULAR
       ===================================================== */

    @media (max-width: 760px) {

      .pagina {

        width: 100%;

        max-width: 100%;

        padding:
          1.5rem
          1rem
          3rem;
      }

      .pagina-cabecalho {

        flex-direction: column;

        gap: 1rem;

        margin-bottom: 1.5rem;
      }

      .pagina-cabecalho > div:first-child {

        max-width: 100%;
      }

      .pagina-cabecalho h1 {

        font-size: 2.4rem;
      }

      .selo-seguranca {

        white-space: normal;
      }

      .documentos-grid {

        grid-template-columns: 1fr;

        gap: 1rem;

        width: 100%;
      }

      .documento-form,
      .status-doc {

        width: 100%;

        padding: 1.2rem;

        border-radius: 20px;
      }

      .privacidade-doc {

        width: 100%;

        padding: 1rem;

        border-radius: 18px;
      }

      .progresso-doc {

        margin-bottom: 1.2rem;
      }

      .linha-passo {

        max-width: none;
      }

      .upload-area {

        min-height: 150px;
      }

    }


    /* =====================================================
       CELULARES PEQUENOS
       ===================================================== */

    @media (max-width: 480px) {

      .pagina {

        padding-left: .75rem;
        padding-right: .75rem;
      }

      .pagina-cabecalho h1 {

        font-size: 2rem;
      }

      .documento-form,
      .status-doc {

        padding: 1rem;
      }

      .passo {

        width: 30px;
        height: 30px;
        flex-basis: 30px;
      }

      .upload-area {

        min-height: 140px;
      }

    }

    /* =====================================================
   AJUSTE DA LARGURA DO TEXTO
   ===================================================== */

.privacidade-conteudo {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
}

.privacidade-doc p {
  width: 100%;
  max-width: none !important;
  line-height: 1.6;
  margin: .1rem 0;
}

  `]
})
export class DocumentosBabaComponent implements OnInit {

  private api = inject(ApiService);

  tipo = 'RG';

  arquivo = signal<File | null>(null);

  arquivoNome = '';

  enviando = signal(false);

  erro = signal('');

  sucesso = signal('');

  dados = signal<any>({
    enviado: false,
    status: 'NAO_ENVIADO',
    nomeArquivo: '',
    motivoReprovacao: ''
  });

  status = () => this.dados().status;

  statusTexto = () => ({
    NAO_ENVIADO: 'Ainda não enviado',
    PENDENTE: 'Em análise',
    APROVADO: 'Documento aprovado',
    REPROVADO: 'Precisa reenviar'
  } as any)[this.status()] || this.status();

  tamanhoArquivo = () => {

    const f = this.arquivo();

    return f
      ? `${(f.size / 1024 / 1024).toFixed(2)} MB`
      : '';
  };


  ngOnInit() {

    this.carregar();

  }


  carregar() {

    this.api.meuDocumento().subscribe({

      next: d => this.dados.set(d),

      error: e => this.erro.set(msgErro(e))

    });

  }


  selecionar(ev: Event) {

    const f =
      (ev.target as HTMLInputElement).files?.[0];

    this.erro.set('');

    this.sucesso.set('');

    if (!f) return;


    if (f.size > 10 * 1024 * 1024) {

      this.erro.set(
        'O arquivo ultrapassa 10 MB.'
      );

      return;
    }


    const ok = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ].includes(f.type);


    if (!ok) {

      this.erro.set(
        'Formato inválido. Envie PDF, JPG ou PNG.'
      );

      return;
    }


    this.arquivo.set(f);

    this.arquivoNome = f.name;

  }


  limparArquivo() {

    this.arquivo.set(null);

    this.arquivoNome = '';

  }


  enviar() {

    const f = this.arquivo();

    if (!f) return;


    const data = new FormData();

    data.append('tipo', this.tipo);

    data.append(
      'arquivo',
      f,
      f.name
    );


    this.enviando.set(true);

    this.erro.set('');

    this.sucesso.set('');


    this.api.enviarDocumento(data).subscribe({

      next: r => {

        this.dados.update(
          d => ({
            ...d,
            ...r
          })
        );

        this.sucesso.set(
          'Documento enviado! A equipe irá analisar seu arquivo.'
        );

        this.limparArquivo();

        this.carregar();

        this.enviando.set(false);

      },

      error: e => {

        this.erro.set(msgErro(e));

        this.enviando.set(false);

      }

    });

  }

}