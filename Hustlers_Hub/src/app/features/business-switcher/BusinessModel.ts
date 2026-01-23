import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ✅ Interface for Business model
export interface Business {
  id: string;
  businessName: string;
  category: string;
  description: string;
  imageUrl: string;
  location: string;
  userId: string;
  businessType?: string;   // optional, e.g., "verified" / "unverified"
  isApproved?: boolean;    // optional
}

// ✅ Business Service for HTTP API calls
@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  private businessUrl = `${environment.apiUrl}/Businesses`;

  constructor(private http: HttpClient) { }

  // =========================
  // BUSINESS APIs
  // =========================

  // Get all businesses for a specific user
  getUserBusinesses(userId: string): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.businessUrl}/user/${userId}`);
  }

  // Create a new business (submit for approval)
  createBusiness(business: Business): Observable<Business> {
    return this.http.post<Business>(this.businessUrl, business);
  }

  // Optional: get a single business by ID
  getBusinessById(id: string): Observable<Business> {
    return this.http.get<Business>(`${this.businessUrl}/${id}`);
  }

  // Optional: get all public (approved) businesses
  getApprovedBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.businessUrl}/public`);
  }
}
