import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isBackendRequest = req.url.startsWith('http://localhost:8080');
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

      if (isBackendRequest && !isAuthRequest && (error.status === 401 || error.status === 403)) {
        authService.logout();
        window.location.reload();
      }

      return throwError(() => error);
    })
  );
};