import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Tipo } from './models';

export const logadoGuard: CanActivateFn = () =>
  inject(AuthService).logado() ? true : inject(Router).createUrlTree(['/login']);

/** Espelha as regras do backend; a autorização de verdade é sempre feita no servidor. */
export const tipoGuard = (...tipos: Tipo[]): CanActivateFn => () => {
  const t = inject(AuthService).tipo();
  return t && tipos.includes(t) ? true : inject(Router).createUrlTree(['/login']);
};
