import { Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

/** Contador do sino. O "lido" fica guardado no navegador (localStorage). */
@Injectable({ providedIn: 'root' })
export class NotifService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  readonly novas = signal(0);

  constructor() {
    effect(() => {
      if (this.auth.logado()) this.atualizar(); else this.novas.set(0);
    }, { allowSignalWrites: true });
    interval(30000).pipe(takeUntilDestroyed()).subscribe(() => { if (this.auth.logado()) this.atualizar(); });
  }

  atualizar() {
    this.api.notificacoes().subscribe({
      next: (l) => {
        const visto = Number(localStorage.getItem('sbVisto') || 0);
        this.novas.set(l.filter((x) => new Date(x.criadoEm).getTime() > visto).length);
      },
      error: () => { /* o sino é opcional */ },
    });
  }

  marcarVistas() {
    localStorage.setItem('sbVisto', String(Date.now()));
    this.novas.set(0);
  }
}
