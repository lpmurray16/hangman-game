import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip adding token for auth-related endpoints
  if (request.url.includes('/auth/login') || 
      request.url.includes('/auth/register') || 
      request.url.includes('/auth/refresh') || 
      request.url.includes('/auth/logout')) {
    return next(request);
  }

  const authToken = authService.getAuthToken();

  if (authToken) {
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${authToken}`)
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Attempt to refresh the token
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.getAuthToken();
              const retryReq = request.clone({
                headers: request.headers.set('Authorization', `Bearer ${newToken}`)
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, log out and redirect
              authService.clearAuthData();
              router.navigate(['/login'], { 
                queryParams: { message: 'Your session has expired. Please log in again.' } 
              });
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  return next(request);
};
