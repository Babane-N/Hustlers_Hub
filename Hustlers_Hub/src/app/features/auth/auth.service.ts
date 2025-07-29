import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7018/api/Users';

  constructor(private http: HttpClient) { }

  register(user: RegisterRequest): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }
}
