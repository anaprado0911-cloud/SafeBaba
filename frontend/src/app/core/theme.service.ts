import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly modo = signal<'light' | 'dark'>(this.inicial());

  constructor() { this.aplicar(); }

  alternar() {
    this.modo.update((m) => (m === 'dark' ? 'light' : 'dark'));
    this.aplicar();
    try { localStorage.setItem('safeBabaTema', this.modo()); } catch { /* ignora */ }
  }

  private aplicar() { document.documentElement.dataset['theme'] = this.modo(); }

  private inicial(): 'light' | 'dark' {
    try {
      const salvo = localStorage.getItem('safeBabaTema');
      if (salvo === 'dark' || salvo === 'light') return salvo;
    } catch { /* ignora */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
