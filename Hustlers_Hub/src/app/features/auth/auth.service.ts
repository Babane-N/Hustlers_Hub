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
  // ✅ Use the apiUrl from environment
  private apiUrl = `${environment.apiUrl}/Users`;

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ✅ Register user
  register(user: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  // ✅ Login user
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  // ✅ Store session info
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

