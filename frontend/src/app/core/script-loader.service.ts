import { Injectable } from '@angular/core';

/** Carrega bibliotecas externas sob demanda (QR Code e mapa). Se falhar, a tela continua funcionando sem elas. */
@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
  private cache = new Map<string, Promise<void>>();

  script(url: string): Promise<void> {
    if (!this.cache.has(url)) {
      this.cache.set(url, new Promise<void>((ok, falha) => {
        const s = document.createElement('script');
        s.src = url;
        s.async = true;
        s.onload = () => ok();
        s.onerror = () => { this.cache.delete(url); falha(new Error('Não foi possível carregar ' + url)); };
        document.head.appendChild(s);
      }));
    }
    return this.cache.get(url)!;
  }

  css(url: string) {
    if (document.querySelector(`link[href="${url}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = url;
    document.head.appendChild(l);
  }
}
