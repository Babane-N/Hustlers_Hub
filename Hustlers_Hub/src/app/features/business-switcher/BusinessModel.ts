import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ 1. Interface for Business model
export interface Business {
  id: string;
  businessName: string;
  category: string;
  description: string;
  location: string;
  userId: string;
}

// ✅ 2. Business Service for HTTP API calls
@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private baseUrl = 'https://localhost:7018/api/Businesses'; // Your backend API route

  constructor(private http: HttpClient) { }

  // Get businesses owned by a user
  getUserBusinesses(userId: string): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.baseUrl}/Users/${userId}`);
  }

  // Create a new business
  createBusiness(business: Business): Observable<Business> {
    return this.http.post<Business>(this.baseUrl, business);
  }

  // More methods can go here
}

