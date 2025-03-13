import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { User, UserCreate, UserLogin } from '../types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private apiUrl = 'http://localhost:8000/auth';
  private authTokenKey = 'authToken'; // Ensure this matches the interceptor
  private tokenExpiryKey = 'tokenExpiry';
  private sessionTimeoutMs = 24 * 60 * 60 * 1000; // 24 hours (extended from 30 minutes)
  private authState = new BehaviorSubject<boolean>(this.hasValidToken());
  private tokenCheckInterval: any;
  private windowEventsSub: Subscription;
  currentUser = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    // Check token validity periodically
    this.tokenCheckInterval = setInterval(
      () => this.checkTokenValidity(),
      60000
    ); // Check every minute

    // Clear token on window close/refresh
    this.windowEventsSub = fromEvent(window, 'beforeunload').subscribe(() => {
      // Only clear if not "remember me" (implement this feature later if needed)
      this.clearTokenIfTemporary();
    });

    // Initialize by checking token validity
    this.checkTokenValidity();

    // Try to load user data if we have a valid token
    if (this.hasValidToken()) {
      this.loadUserData();
    }
  }

  ngOnDestroy(): void {
    // Clean up resources
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    if (this.windowEventsSub) {
      this.windowEventsSub.unsubscribe();
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.authTokenKey);
  }

  private hasValidToken(): boolean {
    if (!this.hasToken()) return false;

    const expiryStr = localStorage.getItem(this.tokenExpiryKey);
    if (!expiryStr) {
      // If we have a token but no expiry, clean up and return false
      this.clearToken();
      return false;
    }

    const expiry = new Date(expiryStr).getTime();
    const now = new Date().getTime();

    if (now >= expiry) {
      // Token expired, clean up
      this.clearToken();
      return false;
    }

    return true;
  }

  private checkTokenValidity(): void {
    const wasAuthenticated = this.authState.value;
    const isNowAuthenticated = this.hasValidToken();

    // Update auth state if changed
    if (wasAuthenticated !== isNowAuthenticated) {
      this.authState.next(isNowAuthenticated);

      // If no longer authenticated, clear user
      if (!isNowAuthenticated) {
        this.currentUser.next(null);
      }
    }
  }

  private clearToken(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
  }

  private clearTokenIfTemporary(): void {
    // Don't clear token on window close/refresh anymore
    // This allows the user to stay logged in between sessions
    // The token will still expire based on the sessionTimeoutMs value
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }

  register(user: UserCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(user: UserLogin): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap((response) => {
        console.log('Login response:', response);
        if (response.session.access_token) {
          // Store token
          localStorage.setItem(
            this.authTokenKey,
            response.session.access_token
          );

          // Set token expiry (current time + session timeout)
          const expiryTime = new Date(
            new Date().getTime() + this.sessionTimeoutMs
          );
          localStorage.setItem(this.tokenExpiryKey, expiryTime.toISOString());

          this.currentUser.next(response.user);
          this.authState.next(true);
        }
      })
    );
  }

  logout(): Observable<any> {
    const authToken = this.getToken();
    const headers = authToken ? new HttpHeaders({ Authorization: `Bearer ${authToken}` }) : undefined;
  
    return this.http
      .post<any>(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearToken();
          this.currentUser.next(null);
          this.authState.next(false);
        })
      );
  }

  getToken(): string | null {
    // Only return token if it's valid
    return this.hasValidToken()
      ? localStorage.getItem(this.authTokenKey)
      : null;
  }

  // Add method to load user data if token exists
  private loadUserData(): void {
    // If we have a valid token but no user data, we could fetch it here
    // This would require an endpoint on your backend
    this.http.get<{ user: User }>(`${this.apiUrl}/me`).subscribe({
      next: (response) => {
        if (response && response.user) {
          this.currentUser.next(response.user);
        }
      },
      error: () => {
        // If we can't load the user data, clear the token
        this.clearToken();
        this.authState.next(false);
      },
    });
  }
}
