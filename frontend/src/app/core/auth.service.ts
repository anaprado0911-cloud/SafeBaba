import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Sessao, Tipo } from './models';

const CHAVE = 'safeBabaSessao';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // sessionStorage: a sessão some ao fechar a aba. Em produção, prefira cookie httpOnly.
  readonly sessao = signal<Sessao | null>(this.ler());
  readonly token = computed(() => this.sessao()?.token ?? null);
  readonly tipo = computed<Tipo | null>(() => this.sessao()?.tipo ?? null);
  readonly logado = computed(() => this.sessao() !== null);

  login(corpo: { email: string; senha: string }) {
    return this.http.post<Sessao>('/api/auth/login', corpo).pipe(tap((s) => this.salvar(s)));
  }

  registrar(corpo: object) {
    return this.http.post<Sessao>('/api/auth/register', corpo).pipe(tap((s) => this.salvar(s)));
  }

  sair() {
    sessionStorage.removeItem(CHAVE);
    this.sessao.set(null);
    this.router.navigate(['/login']);
  }

  private salvar(s: Sessao) {
    sessionStorage.setItem(CHAVE, JSON.stringify(s));
    this.sessao.set(s);
  }

  private ler(): Sessao | null {
    try {
      const bruto = sessionStorage.getItem(CHAVE);
      return bruto ? (JSON.parse(bruto) as Sessao) : null;
    } catch {
      return null;
    }
  }
}
