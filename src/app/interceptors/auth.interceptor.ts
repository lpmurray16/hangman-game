import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpHandlerFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get the auth token from the service
    const token = this.authService.authToken;

    // If token exists, clone the request and add the authorization header
    if (token) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(authReq);
    }

    // If no token, proceed with the original request
    return next.handle(request);
  }
}

// Factory function for the interceptor to be used with withInterceptors
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // This is a factory function that Angular will call with the request and next handler
  // We need to inject the AuthService here
  const authService = inject(AuthService);
  
  // Get the auth token from the service
  const token = authService.authToken;

  // If token exists, clone the request and add the authorization header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  // If no token, proceed with the original request
  return next(req);
}
