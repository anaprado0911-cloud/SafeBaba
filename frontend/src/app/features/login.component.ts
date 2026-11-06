import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { msgErro } from '../core/util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="estreita pagina">
      <h1>Entrar</h1>
      <form class="caixa" [formGroup]="form" (ngSubmit)="entrar()" novalidate>
        @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }
        <div class="campo">
          <label for="email">E-mail</label>
          <input id="email" type="email" formControlName="email" autocomplete="email">
          @if (form.controls.email.touched && form.controls.email.invalid) { <span class="erro-campo">Informe um e-mail válido.</span> }
        </div>
        <div class="campo">
          <label for="senha">Senha</label>
          <input id="senha" type="password" formControlName="senha" autocomplete="current-password">
          @if (form.controls.senha.touched && form.controls.senha.invalid) { <span class="erro-campo">Informe sua senha.</span> }
        </div>
        <button class="btn" type="submit" [disabled]="enviando()">{{ enviando() ? 'Entrando…' : 'Entrar' }}</button>
      </form>
      <p class="muted" style="margin-top:1rem"></p>
      <p class="muted">Ainda não tem conta? <a routerLink="/cadastro">Criar conta</a></p>
    </section>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  erro = signal('');
  enviando = signal(false);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  entrar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.enviando.set(true);
    this.erro.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (s) => this.router.navigate([s.tipo === 'ADMIN' ? '/admin' : '/painel']),
      error: (e) => { this.erro.set(msgErro(e)); this.enviando.set(false); },
    });
  }
}
