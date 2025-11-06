import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Users`;
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) { }

  register(user: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  setSession(token: string, role: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    this.loggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.loggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // 🧠 Decode JWT (no external library needed)
  getUserInfoFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload; // contains sub, role, etc.
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  getUserId(): string | null {
    const user = this.getUserInfoFromToken();
    return user ? user.sub : null; // assuming 'sub' holds user ID
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
