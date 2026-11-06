import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Cuidado } from '../core/models';
import { msgErro } from '../core/util';

@Component({
  selector: 'app-criancas',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="container pagina">
      <h1>Cartão de cuidados</h1>
      <p class="muted">Informações sobre as crianças. A babá só vê durante um atendimento em andamento.</p>
      @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

      <div class="perfil-grid">
        <div>
          @if (lista().length === 0) { <div class="caixa"><p style="margin:0">Nenhuma criança cadastrada ainda.</p></div> }
          @for (c of lista(); track c.id) {
            <article class="caixa solic">
              <div class="linha"><h3 style="margin:0">{{ c.nome }}, {{ c.idade }} anos</h3>
                <button type="button" class="btn pequeno vazio" (click)="remover(c)">Remover</button></div>
              <p class="muted" style="margin:0">Alergias: {{ c.alergias || '—' }}</p>
              <p class="muted" style="margin:0">Remédios: {{ c.remedios || '—' }}</p>
              <p class="muted" style="margin:0">Rotina: {{ c.rotina || '—' }}</p>
              <p class="muted" style="margin:0">Pediatra: {{ c.pediatra || '—' }}, emergência: {{ c.contato || '—' }}</p>
            </article>
          }
        </div>

        <form class="caixa" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
          <h2>Adicionar criança</h2>
          <div class="campo"><label for="nome">Nome</label><input id="nome" type="text" formControlName="nome" maxlength="80"></div>
          <div class="campo"><label for="idade">Idade</label><input id="idade" type="number" min="0" max="17" formControlName="idade"></div>
          <div class="campo"><label for="alergias">Alergias</label><input id="alergias" type="text" formControlName="alergias" maxlength="200"></div>
          <div class="campo"><label for="remedios">Remédios</label><input id="remedios" type="text" formControlName="remedios" maxlength="200"></div>
          <div class="campo"><label for="rotina">Rotina</label><input id="rotina" type="text" formControlName="rotina" maxlength="200"></div>
          <div class="campo"><label for="pediatra">Pediatra</label><input id="pediatra" type="text" formControlName="pediatra" maxlength="120"></div>
          <div class="campo"><label for="contato">Contato de emergência</label><input id="contato" type="text" formControlName="contato" maxlength="120"></div>
          <button class="btn" type="submit">Salvar</button>
        </form>
      </div>
    </section>
  `,
})
export class CriancasComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  lista = signal<Cuidado[]>([]);
  erro = signal('');
  form = this.fb.nonNullable.group({
    nome: ['', Validators.required], idade: [0, Validators.required],
    alergias: [''], remedios: [''], rotina: [''], pediatra: [''], contato: [''],
  });

  ngOnInit() { this.carregar(); }

  private carregar() {
    this.api.cuidados().subscribe({ next: (l) => this.lista.set(l), error: (e) => this.erro.set(msgErro(e)) });
  }

  salvar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.erro.set('Informe o nome e a idade da criança.'); return; }
    this.erro.set('');
    const v = this.form.getRawValue();
    // A API espera todos os campos como texto.
    this.api.criarCuidado({ ...v, idade: String(v.idade) }).subscribe({
      next: () => { this.form.reset({ idade: 0 }); this.carregar(); },
      error: (e) => this.erro.set(msgErro(e)),
    });
  }

  remover(c: Cuidado) {
    this.api.removerCuidado(c.id).subscribe({ next: () => this.carregar(), error: (e) => this.erro.set(msgErro(e)) });
  }
}
