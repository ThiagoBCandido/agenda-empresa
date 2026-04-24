import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const backendBaseUrl =
    window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : 'https://agenda-empresa-backend.onrender.com';

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isBackendRequest = req.url.startsWith(backendBaseUrl);
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

      if (isBackendRequest && !isAuthRequest && (error.status === 401 || error.status === 403)) {
        authService.logout();
        window.location.href = `${window.location.origin}/agenda-empresa/login`;
      }

      return throwError(() => error);
    })
  );
};