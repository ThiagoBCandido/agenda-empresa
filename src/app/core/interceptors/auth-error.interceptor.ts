import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isApiRequest = req.url.startsWith('/auth') || req.url.startsWith('/notes');
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      const shouldLogout = isApiRequest && !isAuthRequest && [401, 403].includes(error.status);

      if (shouldLogout) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};