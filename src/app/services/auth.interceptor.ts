import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip auth for public endpoints
  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  if (isAuthRequest) {
    return next(req);
  }

  const authToken = authService.getToken();
  
  // If no token, redirect to login
  if (!authToken) {
    router.navigate(['/login']);
    return throwError(() => new Error('No auth token'));
  }

  // Check if token is expired before making the request
  if (authService['isTokenExpired']()) {
    return authService['refreshSession']().pipe(
      switchMap(() => {
        const newToken = authService.getToken();
        const modifiedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        });
        return next(modifiedReq);
      }),
      catchError((error) => {
        if(error.status != 500){
          console.error('Token refresh failed:', error);
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  // Proceed with valid token
  const modifiedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Force logout and clear localStorage when token is invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
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
