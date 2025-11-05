import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userTypeSubject = new BehaviorSubject<string | null>(null);
  private token: string | null = null;

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>('/api/auth/login', credentials).pipe(
      map(response => {
        this.token = response.token; // or omit if using secure cookies
        this.userTypeSubject.next(response.userType);
        return response;
      })
    );
  }

  logout(): void {
    this.token = null;
    this.userTypeSubject.next(null);
  }

  getToken(): string | null {
    return this.token;
  }

  getRole(): string | null {
    return this.userTypeSubject.value;
  }

  getUserInfo() {
    return this.http.get<{ userType: number }>('/api/auth/userinfo');
  }


  getUserTypeObservable(): Observable<string | null> {
    return this.userTypeSubject.asObservable();
  }

  // Optional: fetch user info from API if you want role verification on reload
  loadUserInfo(): Observable<any> {
    return this.http.get('/api/auth/me').pipe(
      map((user: any) => {
        this.userTypeSubject.next(user.userType);
        return user;
      })
    );
  }
}

