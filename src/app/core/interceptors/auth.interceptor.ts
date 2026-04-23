import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401 || error.status === 403;

      if (isUnauthorized && !isAuthRoute) {
        authService.handleUnauthorized();
      }

      return throwError(() => error);
    })
  );
};