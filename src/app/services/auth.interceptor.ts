import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();
  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/logout');

  let modifiedReq = req;

  if (authToken && !isAuthRequest) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Force logout and clear localStorage when token is invalid
        const router = inject(Router);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        authService.currentUser.next(null);
        authService.setAuthState(false);
        router.navigate(['/login']);
        console.log('Session expired or invalid token. Logged out.');
      }
      return throwError(() => error);
    })
  );
};
