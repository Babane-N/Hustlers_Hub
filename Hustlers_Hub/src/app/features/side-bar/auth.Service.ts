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

  // -------------------------
  // SESSION MANAGEMENT
  // -------------------------
  setSession(token: string, role: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    this.loggedInSubject.next(true);
  }

  logout(): void {
    localStorage.clear();
    this.loggedInSubject.next(false);
  }

  // -------------------------
  // SIMPLE GETTERS
  // -------------------------
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // -------------------------
  // READ USER OBJECT STORED AT LOGIN
  // -------------------------
  getUser(): any {
    const data = localStorage.getItem('user');
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  getUserId(): string | null {
    return this.getUser()?.id ?? null;
  }

  getBusinessId(): string | null {
    return this.getUser()?.businessId ?? null;
  }

  getUserType(): string | null {
    return this.getUser()?.userType ?? null;
  }

  // -------------------------
  // AUTH STATUS
  // -------------------------
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
