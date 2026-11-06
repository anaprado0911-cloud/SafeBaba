import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { NotifService } from './core/notif.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <a class="sr-only" href="#conteudo">Ir para o conteúdo</a>
    <header class="topo">
      <a routerLink="/" class="marca" aria-label="Safe Babá, página inicial">
        <svg viewBox="0 0 48 48" aria-hidden="true" class="logo-ursinho">
          <circle cx="12" cy="12" r="8" fill="#E7A879" stroke="#754A3B" stroke-width="2.2"/>
          <circle cx="36" cy="12" r="8" fill="#E7A879" stroke="#754A3B" stroke-width="2.2"/>
          <circle cx="24" cy="25" r="17" fill="#F2C69B" stroke="#754A3B" stroke-width="2.2"/>
          <ellipse cx="24" cy="29" rx="10" ry="7.5" fill="#FFF0D9"/>
          <circle cx="18" cy="23" r="1.8" fill="#49332E"/><circle cx="30" cy="23" r="1.8" fill="#49332E"/>
          <ellipse cx="24" cy="28" rx="2.7" ry="2" fill="#49332E"/>
          <path d="M21 32q3 3 6 0" fill="none" stroke="#49332E" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M24 39c-3-3-8-5-8-9 0-3 4-4 8 0 4-4 8-3 8 0 0 4-5 6-8 9z" fill="#E77D79"/>
        </svg>
        Safe Babá
      </a>
      <nav class="menu" aria-label="Principal">
        <a routerLink="/babas" routerLinkActive="ativo">Encontrar babá</a>
        @if (auth.logado()) {
          @if (auth.tipo() === 'PAI') {
            <a routerLink="/agora" routerLinkActive="ativo">Preciso agora</a>
          }
          <a routerLink="/painel" routerLinkActive="ativo">Meu painel</a>
          @if (auth.tipo() !== 'ADMIN') {
            <a routerLink="/agenda" routerLinkActive="ativo">Agenda</a>
          }
          @if (auth.tipo() === 'PAI') {
            <a routerLink="/criancas" routerLinkActive="ativo">Cuidados</a>
            <a routerLink="/assinatura" routerLinkActive="ativo">Plano da família</a>
          }
          @if (auth.tipo() === 'ADMIN') {
            <a routerLink="/admin" routerLinkActive="ativo">Moderação</a>
          }
          <a routerLink="/notificacoes" class="sino" routerLinkActive="ativo" aria-label="Notificações">
            Avisos @if (notif.novas() > 0) { <span class="n">{{ notif.novas() }}</span> }
          </a>
          <button type="button" class="btn vazio pequeno" (click)="auth.sair()">Sair</button>
        } @else {
          <a routerLink="/login" class="btn vazio pequeno">Entrar</a>
          <a routerLink="/cadastro" class="btn pequeno">Criar conta</a>
        }
        <button type="button" class="btn vazio pequeno" (click)="tema.alternar()" [attr.aria-pressed]="tema.modo() === 'dark'">
          {{ tema.modo() === 'dark' ? 'Tema claro' : 'Tema escuro' }}
        </button>
      </nav>
    </header>
    <main id="conteudo"><router-outlet /></main>
    <footer class="rodape">
      <div class="container">
        <p>Safe Babá, projeto para feira de tecnologia. <a routerLink="/privacidade">Como protegemos seus dados</a></p>
      </div>
    </footer>
  `,
})
export class AppComponent {
  auth = inject(AuthService);
  tema = inject(ThemeService);
  notif = inject(NotifService);
}
