import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ✅ Fetch current logged-in user's profile (with UserType enum)
  getCurrentUser(): Observable<any> {
    const userId = localStorage.getItem('userId'); // Ensure userId is stored on login
    if (!userId) {
      throw new Error('User ID not found in localStorage.');
    }

    return this.http.get<any>(`${this.baseUrl}/Users/${userId}`);
  }

  // ✅ Logout user and clear all storage
  logout(): void {
    localStorage.clear();
  }
}
