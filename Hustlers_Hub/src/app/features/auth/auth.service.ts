import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  userType: number; // 👈 Add this if needed
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ---------------------------
  // 🔥 Register user
  // ---------------------------
  register(user: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  // ---------------------------
  // 🔥 Login user
  // ---------------------------
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  // ---------------------------
  // 🔐 Save token + role
  // ---------------------------
  setSession(token: string, role: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role); // keep original casing
    this.loggedInSubject.next(true);
  }

  // ---------------------------
  // ✅ NEW: Save user object
  // ---------------------------
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // ---------------------------
  // Logout
  // ---------------------------
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    this.loggedInSubject.next(false);
  }

  // ---------------------------
  // Get token
  // ---------------------------
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // ---------------------------
  // Get role
  // ---------------------------
  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // ---------------------------
  // Get user object
  // ---------------------------
  getUser(): any {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  // ---------------------------
  // Logged in status
  // ---------------------------
  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // ---------------------------
  // Internal: check token
  // ---------------------------
  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
