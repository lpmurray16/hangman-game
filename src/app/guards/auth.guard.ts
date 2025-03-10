import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // For login and register routes, redirect to game if already logged in
    if (state.url.includes('/login') || state.url.includes('/register')) {
      if (this.authService.isLoggedIn) {
        this.router.navigate(['/game']);
        return false;
      }
      return true;
    }
    
    // For protected routes, redirect to login if not logged in
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
}