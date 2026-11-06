import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { msgErro } from '../core/util';

const UFS = [
  { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' },
];

const iguais = (g: AbstractControl) =>
  g.get('senha')?.value === g.get('confirmarSenha')?.value ? null : { senhasDiferentes: true };

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="estreita pagina">
      <h1>Criar conta</h1>
      <div class="abas" role="group" aria-label="Tipo de conta">
        <button type="button" class="btn vazio aba" [class.ativa]="tipo === 'PAI'" [attr.aria-pressed]="tipo === 'PAI'" (click)="definir('PAI')">Sou responsável</button>
        <button type="button" class="btn vazio aba" [class.ativa]="tipo === 'BABA'" [attr.aria-pressed]="tipo === 'BABA'" (click)="definir('BABA')">Sou babá</button>
      </div>

      <form class="caixa" [formGroup]="form" (ngSubmit)="enviar()" novalidate>
        @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

        <div class="campo">
          <label for="nome">Nome completo</label>
          <input id="nome" type="text" formControlName="nome" autocomplete="name">
          @if (c.nome.touched && c.nome.invalid) { <span class="erro-campo">Informe seu nome.</span> }
        </div>
        <div class="duas-colunas">
          <div class="campo">
            <label for="email">E-mail</label>
            <input id="email" type="email" formControlName="email" autocomplete="email">
            @if (c.email.touched && c.email.invalid) { <span class="erro-campo">Informe um e-mail válido.</span> }
          </div>
          <div class="campo">
            <label for="telefone">Telefone</label>
            <input id="telefone" type="text" formControlName="telefone" inputmode="tel" autocomplete="tel">
            @if (c.telefone.touched && c.telefone.invalid) { <span class="erro-campo">Informe um telefone.</span> }
          </div>
          <div class="grupo-senhas">
            <div class="campo campo-senha">
              <label for="senha">Senha</label>
              <div class="entrada-senha">
                <input id="senha" [type]="mostrarSenha() ? 'text' : 'password'" formControlName="senha" autocomplete="new-password">
                <button class="alternar-senha" type="button" (click)="mostrarSenha.set(!mostrarSenha())"
                  [attr.aria-label]="mostrarSenha() ? 'Ocultar senha' : 'Mostrar senha'"
                  [attr.aria-pressed]="mostrarSenha()">
                  {{ mostrarSenha() ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
              @if (c.senha.touched && c.senha.invalid) { <span class="erro-campo">Use no mínimo 8 caracteres, incluindo maiúscula, minúscula e número.</span> }
            </div>
            <div class="campo campo-senha">
              <label for="confirmar">Confirmar senha</label>
              <div class="entrada-senha">
                <input id="confirmar" [type]="mostrarConfirmarSenha() ? 'text' : 'password'" formControlName="confirmarSenha" autocomplete="new-password">
                <button class="alternar-senha" type="button" (click)="mostrarConfirmarSenha.set(!mostrarConfirmarSenha())"
                  [attr.aria-label]="mostrarConfirmarSenha() ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'"
                  [attr.aria-pressed]="mostrarConfirmarSenha()">
                  {{ mostrarConfirmarSenha() ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
              @if (c.confirmarSenha.touched && form.hasError('senhasDiferentes')) { <span class="erro-campo">As senhas não coincidem.</span> }
            </div>
            <div class="ajuda requisitos-senha" aria-live="polite">
              <span [class.requisito-ok]="senhaTemTamanho()">{{ senhaTemTamanho() ? '✓' : '•' }} Pelo menos 8 caracteres</span>
              <span [class.requisito-ok]="senhaTemMaiuscula()">{{ senhaTemMaiuscula() ? '✓' : '•' }} Uma letra maiúscula</span>
              <span [class.requisito-ok]="senhaTemMinuscula()">{{ senhaTemMinuscula() ? '✓' : '•' }} Uma letra minúscula</span>
              <span [class.requisito-ok]="senhaTemNumero()">{{ senhaTemNumero() ? '✓' : '•' }} Um número</span>
            </div>
          </div>
          <div class="campo">
            <label for="estado">Estado (UF)</label>
            <select id="estado" formControlName="estado" autocomplete="address-level1" (change)="carregarCidades($any($event.target).value)">
              <option value="">Selecione o estado</option>
              @for (uf of ufs; track uf.sigla) {
                <option [value]="uf.sigla">{{ uf.nome }} ({{ uf.sigla }})</option>
              }
            </select>
            @if (c.estado.touched && c.estado.invalid) { <span class="erro-campo">Selecione um estado.</span> }
          </div>
          <div class="campo">
            <label for="cidade">Cidade / município</label>
            <select id="cidade" formControlName="cidade" autocomplete="address-level2" [disabled]="!c.estado.value || carregandoCidades() || cidades().length === 0">
              <option value="">{{ carregandoCidades() ? 'Carregando municípios…' : (c.estado.value ? 'Selecione a cidade' : 'Selecione primeiro o estado') }}</option>
              @for (cidade of cidades(); track cidade.id) {
                <option [value]="cidade.nome">{{ cidade.nome }}</option>
              }
            </select>
            @if (carregandoCidades()) { <span class="ajuda">Buscando municípios do estado selecionado…</span> }
            @if (cidadesErro()) { <span class="erro-campo">Não foi possível carregar as cidades. Confira sua conexão e selecione novamente o estado.</span> }
            @if (c.cidade.touched && c.cidade.invalid) { <span class="erro-campo">Selecione a cidade.</span> }
          </div>
        </div>

        @if (tipo === 'BABA') {
          <div class="campo">
            <label for="descricao">Apresentação</label>
            <textarea id="descricao" formControlName="descricao" maxlength="500"></textarea>
          </div>
          <div class="duas-colunas">
            <div class="campo">
              <label for="exp">Anos de experiência</label>
              <input id="exp" type="number" min="0" max="60" formControlName="experienciaAnos">
            </div>
            <div class="campo">
              <label for="valor">Valor por hora (R$)</label>
              <input id="valor" type="number" min="0" formControlName="valorHora">
            </div>
          </div>
          <div class="campo">
            <label for="disp">Disponibilidade</label>
            <input id="disp" type="text" formControlName="disponibilidade" placeholder="Ex.: Seg a Sex, 7h às 19h">
          </div>
        }

        <label style="display:flex;gap:.6rem;align-items:flex-start;margin-bottom:.5rem">
          <input type="checkbox" formControlName="aceite">
          <span>Li e aceito a <a routerLink="/privacidade" target="_blank">política de privacidade</a> e o tratamento dos meus dados pessoais conforme a LGPD.</span>
        </label>
        @if (c.aceite.touched && c.aceite.invalid) { <span class="erro-campo">É preciso aceitar para criar a conta.</span> }

        <div class="acoes">
          <span></span>
          <button type="submit" class="btn sol" [disabled]="enviando()">{{ enviando() ? 'Criando…' : 'Criar minha conta' }}</button>
        </div>
      </form>
      <p class="muted" style="margin-top:1rem">Já tem conta? <a routerLink="/login">Entrar</a></p>
    </section>
  `,
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  readonly ufs = UFS;
  readonly cidades = signal<{ id: number; nome: string }[]>([]);
  readonly carregandoCidades = signal(false);
  readonly cidadesErro = signal(false);
  private auth = inject(AuthService);
  private router = inject(Router);

  tipo: 'PAI' | 'BABA' = 'PAI';
  erro = signal('');
  enviando = signal(false);
  mostrarSenha = signal(false);
  mostrarConfirmarSenha = signal(false);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)]],
    confirmarSenha: ['', Validators.required],
    cidade: ['', Validators.required],
    estado: ['', Validators.required],
    descricao: [''],
    experienciaAnos: [0],
    valorHora: [0],
    disponibilidade: [''],
    aceite: [false, Validators.requiredTrue],
  }, { validators: iguais });
  get c() { return this.form.controls; }

  senhaTemTamanho() { return this.c.senha.value.length >= 8; }
  senhaTemMaiuscula() { return /[A-Z]/.test(this.c.senha.value); }
  senhaTemMinuscula() { return /[a-z]/.test(this.c.senha.value); }
  senhaTemNumero() { return /\d/.test(this.c.senha.value); }

  constructor() {
    if (inject(ActivatedRoute).snapshot.queryParamMap.get('tipo') === 'BABA') this.tipo = 'BABA';
  }

  definir(t: 'PAI' | 'BABA') { this.tipo = t; }

  carregarCidades(uf: string) {
    this.form.controls.cidade.setValue('');
    this.form.controls.cidade.markAsUntouched();
    this.cidades.set([]);
    this.cidadesErro.set(false);
    if (!uf) return;
    this.carregandoCidades.set(true);
    this.http.get<{ id: number; nome: string }[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios?orderBy=nome`).subscribe({
      next: (lista) => { this.cidades.set(lista); this.carregandoCidades.set(false); },
      error: () => { this.cidadesErro.set(true); this.carregandoCidades.set(false); },
    });
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Confira os campos destacados. A senha deve ter 8 caracteres, maiúscula, minúscula e número; as senhas devem coincidir e a política precisa ser aceita.');
      return;
    }
    this.enviando.set(true);
    this.erro.set('');
    const v = this.form.getRawValue();
    const corpo: Record<string, unknown> = {
      nome: v.nome.trim(), email: v.email.trim(), senha: v.senha, telefone: v.telefone.trim(),
      cidade: v.cidade.trim(), estado: v.estado.toUpperCase(), tipo: this.tipo,
    };
    if (this.tipo === 'BABA') {
      corpo['descricao'] = v.descricao;
      corpo['experienciaAnos'] = Number(v.experienciaAnos) || 0;
      corpo['valorHora'] = Number(v.valorHora) || 0;
      corpo['disponibilidade'] = v.disponibilidade;
    }
    this.auth.registrar(corpo).subscribe({
      next: () => this.router.navigate(['/painel']),
      error: (e) => { this.erro.set(msgErro(e)); this.enviando.set(false); },
    });
  }
}
