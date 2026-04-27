import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { BACKEND_BASE_URL } from '../config/api.config';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register');
      const shouldLogout = req.url.startsWith(BACKEND_BASE_URL) && !isAuthRequest && [401, 403].includes(error.status);

      if (shouldLogout) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};