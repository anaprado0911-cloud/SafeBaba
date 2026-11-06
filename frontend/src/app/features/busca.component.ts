import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Baba, Confianca } from '../core/models';
import { msgErro } from '../core/util';
import { BabaCardComponent } from '../shared/baba-card.component';

@Component({
  selector: 'app-busca',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, BabaCardComponent],
  template: `
    <section class="container pagina">
      <h1>Encontrar babá</h1>

      <form class="caixa filtros" [formGroup]="form" (ngSubmit)="buscar()" aria-label="Filtros de busca">
        <div class="campo"><label for="f-cidade">Cidade</label><input id="f-cidade" type="text" formControlName="cidade" autocomplete="address-level2"></div>
        <div class="campo"><label for="f-valor">Valor máximo por hora (R$)</label><input id="f-valor" type="number" min="0" formControlName="valorMax"></div>
        <div class="campo">
          <label for="f-nota">Nota mínima</label>
          <select id="f-nota" formControlName="notaMin">
            <option [ngValue]="0">Qualquer</option>
            <option [ngValue]="3">3 ou mais</option>
            <option [ngValue]="4">4 ou mais</option>
            <option [ngValue]="4.5">4,5 ou mais</option>
          </select>
        </div>
        <div class="campo">
          <label for="f-ordem">Ordenar por</label>
          <select id="f-ordem" formControlName="ordem">
            <option value="confianca">Mais confiáveis</option>
            <option value="nota">Melhor nota</option>
            <option value="preco">Menor preço</option>
          </select>
        </div>
        <div class="campo"><label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" formControlName="soVerificadas"> Somente verificadas</label></div>
        <div class="campo"><button class="btn" type="submit">Buscar na cidade</button></div>
      </form>

      <div aria-live="polite" style="margin-top:2rem">
        @if (erro()) { <div class="aviso erro" role="alert">{{ erro() }}</div> }

        @if (carregando()) {
          <div class="grade"> @for (n of [1, 2, 3]; track n) { <div class="esqueleto"></div> } </div>
        } @else if (visiveis().length === 0) {
          <div class="vazio-estado">
            <h2>Nenhuma babá encontrada</h2>
            <p>Tente aumentar o valor máximo, baixar a nota mínima ou buscar em outra cidade.</p>
          </div>
        } @else {
          <p class="muted">{{ visiveis().length }} {{ visiveis().length === 1 ? 'babá encontrada' : 'babás encontradas' }}</p>
          <div class="grade">
            @for (b of visiveis(); track b.id) {
              <app-baba-card [baba]="b" [conf]="conf()[b.id]" [mostrarFavorito]="auth.logado()"
                             [favorito]="favs().has(b.id)" (alternar)="alternarFavorito($event)" />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class BuscaComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  carregando = signal(false);
  erro = signal('');
  lista = signal<Baba[]>([]);
  conf = signal<Record<number, Confianca>>({});
  favs = signal<Set<number>>(new Set());

  form = this.fb.group({
    cidade: [''],
    valorMax: [null as number | null],
    notaMin: [0],
    ordem: ['confianca'],
    soVerificadas: [false],
  });
  private filtros = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  // Filtros de valor, nota e verificação rodam no navegador; a cidade é consultada no servidor.
  visiveis = computed(() => {
    const f = this.filtros();
    const c = this.conf();
    const pontos = (b: Baba) => c[b.id]?.score ?? 0;
    const lista = this.lista().filter((b) =>
      Number(b.valorHora || 0) <= (f.valorMax ?? Infinity)
      && Number(b.notaMedia || 0) >= (f.notaMin ?? 0)
      && (!f.soVerificadas || b.verificada));
    return lista.sort((a, b) =>
      f.ordem === 'preco' ? a.valorHora - b.valorHora
      : f.ordem === 'nota' ? b.notaMedia - a.notaMedia
      : pontos(b) - pontos(a));
  });

  ngOnInit() {
    const cidade = this.route.snapshot.queryParamMap.get('cidade');
    if (cidade) this.form.patchValue({ cidade });
    this.carregar();
  }

  buscar() {
    const cidade = (this.form.value.cidade ?? '').trim();
    this.router.navigate([], { queryParams: cidade ? { cidade } : {}, replaceUrl: true });
    this.carregar();
  }

  private carregar() {
    this.carregando.set(true);
    this.erro.set('');
    const cidade = (this.form.value.cidade ?? '').trim();
    this.api.babas(cidade).subscribe({
      next: (l) => {
        this.lista.set(l);
        this.carregando.set(false);
        this.api.confiancas().subscribe({ next: (c) => this.conf.set(c), error: () => this.conf.set({}) });
        if (this.auth.logado()) this.api.favoritos().subscribe({ next: (f) => this.favs.set(new Set(f)), error: () => { /* opcional */ } });
      },
      error: (e) => { this.erro.set(msgErro(e)); this.carregando.set(false); },
    });
  }

  alternarFavorito(id: number) {
    this.api.alternarFavorito(id).subscribe({
      next: (r) => this.favs.update((s) => { const n = new Set(s); if (r.favorito) n.add(id); else n.delete(id); return n; }),
      error: (e) => this.erro.set(msgErro(e)),
    });
  }
}
