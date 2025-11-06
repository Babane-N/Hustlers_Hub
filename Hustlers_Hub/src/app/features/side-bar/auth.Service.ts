import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>('/api/auth/login', credentials).pipe(
      tap(response => {
        // Store token and role in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.role); // 👈 Store the role
        localStorage.setItem('userId', response.userId); // Optional
      })
    );
  }

  logout() {
    localStorage.clear();
  }
  getUserProfile() {
    return this.http.get<any>('https://your-azure-api-url/api/users/profile');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }
}
