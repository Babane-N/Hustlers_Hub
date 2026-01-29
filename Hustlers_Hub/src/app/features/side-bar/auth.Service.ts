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

  // -----------------------------
  // Reactive state
  // -----------------------------
  private userSubject = new BehaviorSubject<any | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  private roleSubject = new BehaviorSubject<string | null>(this.getStoredRole());
  role$ = this.roleSubject.asObservable();

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) { }

  // -----------------------------
  // API calls
  // -----------------------------
  register(user: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  // -----------------------------
  // SESSION MANAGEMENT
  // -----------------------------
  setSession(token: string, role: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);

    this.roleSubject.next(role);
    this.loggedInSubject.next(true);
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout(): void {
    localStorage.clear();
    this.userSubject.next(null);
    this.roleSubject.next(null);
    this.loggedInSubject.next(false);
  }

  // -----------------------------
  // HELPERS
  // -----------------------------
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser(): any {
    return this.userSubject.value;
  }

  getRole(): string | null {
    return this.roleSubject.value;
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

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  // -----------------------------
  // Private storage helpers
  // -----------------------------
  private getStoredUser(): any | null {
    const data = localStorage.getItem('user');
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private getStoredRole(): string | null {
    return localStorage.getItem('userRole');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

