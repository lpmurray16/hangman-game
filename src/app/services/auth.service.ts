import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { User, UserCreate, UserLogin, AuthResponse } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://fastapi-supabase-sho6.onrender.com'; // Updated to deployed backend URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  constructor(private http: HttpClient) {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }
  register(userData: UserCreate): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response) => {
          // Store user details and token in localStorage
          this.storeUserData(response);
        })
      );
  }
  login(credentials: UserLogin): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          // Store user details and token in localStorage
          this.storeUserData(response);
        })
      );
  }
  logout(): Observable<any> {
    // Clear user from localStorage and the BehaviorSubject
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);

    // Call the logout endpoint
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }
  private storeUserData(response: AuthResponse): void {
    const user = {
      ...response.user,
      token: response.token,
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', response.token);
    this.currentUserSubject.next(user);
  }
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
  get authToken(): string | null {
    return localStorage.getItem('token');
  }
}
