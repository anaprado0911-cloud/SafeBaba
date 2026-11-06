import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Anexa o JWT às chamadas /api e encerra a sessão quando o token expira (401). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const requisicao = token && req.url.startsWith('/api')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro) => {
      if (erro.status === 401 && token && !req.url.startsWith('/api/auth/')) auth.sair();
      return throwError(() => erro);
    }),
  );
};
