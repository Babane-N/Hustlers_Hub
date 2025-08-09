import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private apiUrl = 'https://localhost:7018/api'; // ✅ Ensure this matches your backend

  constructor(private http: HttpClient) { }

  registerBusiness(formData: FormData) {
    return this.http.post(`${this.apiUrl}/Businesses`, formData);
  }
}
