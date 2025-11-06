import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/Services`;

  constructor(private http: HttpClient) { }

  // 🧠 Fetch current logged-in user profile (includes UserType enum)
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Users/{id}`);
  }

  logout(): void {
    localStorage.clear();
  }
}
