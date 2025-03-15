import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, UserCreate, UserLogin } from '../types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.backend_api_url + '/auth';
  private authTokenKey = 'authToken';
  private authState = new BehaviorSubject<boolean>(this.hasToken());
  currentUser = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    // Load user data if we have a token
    if (this.hasToken()) {
      this.loadUserData();
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.authTokenKey);
  }

  private clearToken(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem('currentUser');
  }

  forceLogout(): void {
    this.clearToken();
    this.currentUser.next(null);
    this.authState.next(false);
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
        if (response && response.session) {
          // Store token
          const token = response.session.access_token;
          if (token.length > 0) {
            localStorage.setItem(this.authTokenKey, token);
          } else {
            console.error('Invalid token format:', token);
          }

          // Extract username from user_metadata if available
          const username = response.user?.user_metadata?.username || 'User';

          // Create a proper User object
          const userData: User = {
            id: response.user.id,
            email: response.user.email,
            username: username,
            created_at: response.user.created_at,
          };

          // Store user data in localStorage
          localStorage.setItem('currentUser', JSON.stringify(userData));

          this.currentUser.next(userData);
          this.authState.next(true);
        } else {
          console.error(
            'Token not found in response. Response structure:',
            Object.keys(response)
          );
        }
      })
    );
  }

  logout(): Observable<any> {
    const authToken = this.getToken();
    const headers = authToken
      ? new HttpHeaders({ Authorization: `Bearer ${authToken}` })
      : undefined;

    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        this.clearToken();
        this.currentUser.next(null);
        this.authState.next(false);
      }),
      catchError((error) => {
        // Even if the API call fails, we still want to log out locally
        console.log('Logout API call failed, forcing local logout');
        this.forceLogout();
        return throwError(() => error);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  setAuthState(state: boolean): void {
    this.authState.next(state);
  }

  private loadUserData(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.next(JSON.parse(storedUser));
      this.authState.next(true);
    } else {
      this.authState.next(false);
      this.clearToken();
    }
  }
}
