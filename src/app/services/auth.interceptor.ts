import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Get the auth service using inject
  const authService = inject(AuthService);
  
  // Get the auth token from the service
  const authToken = authService.getAuthToken();

  // Clone the request and add the authorization header if token exists
  if (authToken) {
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${authToken}`)
    });
    return next(authReq);
  }
  
  // If no token, proceed with the original request
  return next(request);
}