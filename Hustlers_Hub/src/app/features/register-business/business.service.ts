import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private baseUrl = `${environment.apiUrl}/Businesses`; // ✅ Ensure this matches your backend

  constructor(private http: HttpClient) { }

  registerBusiness(formData: FormData) {
    return this.http.post(`${this.baseUrl}`, formData);
  }
}
