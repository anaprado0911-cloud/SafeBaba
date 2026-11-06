import { Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Agendamento, Baba } from '../core/models';
import { msgErro } from '../core/util';
import { UFS } from './ufs';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="estreita pagina">
      <h1>Agendar {{ baba()?.nome }}</h1>
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }
      @if (criado(); as c) {
        <div class="aviso ok" role="status">
          Agendamento solicitado. A babá vai aceitar ou recusar.
          <a [routerLink]="['/atendimento', c.id]"><b>Abrir acompanhamento</b></a>
        </div>
      }

      <form class="caixa" [formGroup]="form" (ngSubmit)="enviar()" novalidate>
        <div class="campo">
          <label for="data">Data</label>
          <input id="data" type="date" formControlName="dataServico" [min]="hoje">
          @if (c.dataServico.touched && c.dataServico.invalid) { <span class="erro-campo">Escolha a data.</span> }
        </div>
        <div class="duas-colunas">
          <div class="campo">
            <label for="ini">Início</label>
            <input id="ini" type="time" formControlName="horaInicio">
          </div>
          <div class="campo">
            <label for="fim">Fim</label>
            <input id="fim" type="time" formControlName="horaFim">
          </div>
        </div>
        @if (form.touched && (c.horaInicio.invalid || c.horaFim.invalid)) { <span class="erro-campo">Informe o horário de início e de fim.</span> }
        <fieldset class="grupo-endereco" style="border:1px solid var(--borda, #ead8ca);border-radius:14px;padding:1rem;margin:1rem 0">
          <legend>Endereço completo do atendimento</legend>
          <div class="campo">
            <label for="rua">Rua / avenida *</label>
            <input id="rua" type="text" formControlName="rua" autocomplete="address-line1" placeholder="Ex.: Rua das Flores">
            @if (c.rua.touched && c.rua.invalid) { <span class="erro-campo">Informe a rua ou avenida.</span> }
          </div>
          <div class="duas-colunas">
            <div class="campo">
              <label for="numero">Número *</label>
              <input id="numero" type="text" formControlName="numero" autocomplete="address-line2" placeholder="Ex.: 250">
              @if (c.numero.touched && c.numero.invalid) { <span class="erro-campo">Informe o número.</span> }
            </div>
            <div class="campo">
              <label for="complemento">Complemento</label>
              <input id="complemento" type="text" formControlName="complemento" placeholder="Apto, bloco, casa">
            </div>
          </div>
          <div class="duas-colunas">
            <div class="campo">
              <label for="bairro">Bairro *</label>
              <input id="bairro" type="text" formControlName="bairro" autocomplete="address-level3" placeholder="Ex.: Centro">
              @if (c.bairro.touched && c.bairro.invalid) { <span class="erro-campo">Informe o bairro.</span> }
            </div>
            <div class="campo">
              <label for="cep">CEP</label>
              <input id="cep" type="text" formControlName="cep" autocomplete="postal-code" maxlength="9" placeholder="00000-000">
            </div>
          </div>
          <div class="duas-colunas">
            <div class="campo">
              <label for="cidade">Cidade *</label>
              <select id="cidade" formControlName="cidade" autocomplete="address-level2" [disabled]="!c.uf.value || carregandoCidades() || cidades().length === 0"><option value="">{{ carregandoCidades() ? 'Carregando municípios…' : 'Selecione a cidade' }}</option>@for (cidade of cidades(); track cidade.id) { <option [value]="cidade.nome">{{ cidade.nome }}</option> }</select>
              @if (c.cidade.touched && c.cidade.invalid) { <span class="erro-campo">Informe a cidade.</span> }
            </div>
            <div class="campo">
              <label for="uf">Estado (UF) *</label>
              <select id="uf" formControlName="uf" autocomplete="address-level1" (change)="carregarCidades($any($event.target).value)"><option value="">Selecione o estado</option>@for (uf of ufs; track uf.sigla) { <option [value]="uf.sigla">{{ uf.nome }} ({{ uf.sigla }})</option> }</select>
              @if (c.uf.touched && c.uf.invalid) { <span class="erro-campo">Informe a UF.</span> }
            </div>
          </div>
          <div class="campo">
            <label for="referencia">Ponto de referência</label>
            <input id="referencia" type="text" formControlName="referencia" placeholder="Ex.: próximo à praça, portaria principal">
          </div>
          <span class="ajuda">O endereço completo será enviado à babá junto com a solicitação.</span>
        </fieldset>
        <div class="campo">
          <label for="qtd">Quantidade de crianças</label>
          <input id="qtd" type="number" min="1" max="10" formControlName="quantidadeCriancas">
        </div>
        <div class="campo">
          <label for="obs">Observações</label>
          <textarea id="obs" formControlName="observacoes" maxlength="500"></textarea>
          <span class="ajuda">Evite dados sensíveis das crianças; use o cartão de cuidados.</span>
        </div>
        <button class="btn sol" type="submit" [disabled]="enviando() || !paiId()">Solicitar agendamento</button>
      </form>
    </section>
  `,
})
export class AgendarComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  readonly ufs = UFS;
  cidades = signal<{id:number;nome:string}[]>([]);
  carregandoCidades = signal(false);

  babaId = input.required<string>(); // parâmetro da rota
  baba = signal<Baba | null>(null);
  paiId = signal<number | null>(null);
  erro = signal('');
  enviando = signal(false);
  criado = signal<Agendamento | null>(null);

  hoje = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

  form = this.fb.nonNullable.group({
    dataServico: ['', Validators.required],
    horaInicio: ['', Validators.required],
    horaFim: ['', Validators.required],
    rua: ['', Validators.required],
    numero: ['', Validators.required],
    complemento: [''],
    bairro: ['', Validators.required],
    cep: [''],
    cidade: ['', Validators.required],
    uf: ['', [Validators.required, Validators.maxLength(2)]],
    referencia: [''],
    quantidadeCriancas: [1, [Validators.required, Validators.min(1)]],
    observacoes: [''],
  });
  get c() { return this.form.controls; }

  ngOnInit() {
    const qp = this.route.snapshot.queryParamMap;
    this.form.patchValue({ dataServico: qp.get('data') || '', horaInicio: qp.get('inicio') || '', horaFim: qp.get('fim') || '' });
    this.api.baba(Number(this.babaId())).subscribe({ next: (b) => this.baba.set(b), error: (e) => this.erro.set(msgErro(e)) });
    this.api.paiPorUsuario(this.auth.sessao()!.id).subscribe({
      next: (p) => {
        this.paiId.set(p.id);
        this.api.pai(p.id).subscribe({ next: (d) => { const uf = d.estado || ''; const cidade = d.cidade || ''; this.form.patchValue({ cidade, uf }); this.carregarCidades(uf, cidade); if (d.endereco) { const partes = d.endereco.split(',').map((x: string) => x.trim()).filter(Boolean); const numero = partes[1]?.match(/^(?:n[º°.]?\s*)?(\d+[A-Za-z]?)$/i)?.[1] || ''; this.form.patchValue({ rua: numero ? partes[0] : d.endereco, numero }); } }, error: () => { /* opcional */ } });
      },
      error: (e) => this.erro.set(msgErro(e)),
    });
  }

  carregarCidades(uf: string, cidadeInicial = '') {
    this.cidades.set([]); if (!uf) return; if (!cidadeInicial) this.form.controls.cidade.setValue(''); this.carregandoCidades.set(true);
    this.http.get<{id:number;nome:string}[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios?orderBy=nome`).subscribe({
      next: lista => { this.cidades.set(lista); this.carregandoCidades.set(false); if (cidadeInicial && lista.some(x => x.nome === cidadeInicial)) this.form.controls.cidade.setValue(cidadeInicial); },
      error: () => this.carregandoCidades.set(false)
    });
  }

  enviar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.enviando.set(true);
    this.erro.set('');
    const v = this.form.getRawValue();
    const endereco = [v.rua.trim(), `nº ${v.numero.trim()}`, v.complemento.trim(), v.bairro.trim(), `${v.cidade.trim()} - ${v.uf.trim().toUpperCase()}`, v.cep.trim() ? `CEP ${v.cep.trim()}` : '', v.referencia.trim() ? `Referência: ${v.referencia.trim()}` : ''].filter(Boolean).join(', ');
    this.api.criarAgendamento({ paiId: this.paiId(), babaId: Number(this.babaId()), dataServico: v.dataServico, horaInicio: v.horaInicio, horaFim: v.horaFim, endereco, quantidadeCriancas: v.quantidadeCriancas, observacoes: v.observacoes }).subscribe({
      next: (a) => { this.criado.set(a); this.enviando.set(false); this.form.reset({ quantidadeCriancas: 1 }); },
      error: (e) => { this.erro.set(msgErro(e)); this.enviando.set(false); },
    });
  }
}
