import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// 📌 Service + Business details
export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  price: number;
  durationMinutes: number;

  businessName: string;
  logoUrl?: string | null;
  businessLocation: string;
  businessDescription?: string;
  isVerified: boolean;
}

// 📌 Reviews
export interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceProvider {
  private baseUrl = `${environment.apiUrl}/Services`;

  constructor(private http: HttpClient) { }

  // ✅ Get one service detail by ID
  getServiceDetails(id: string): Observable<ServiceDetail> {
    return this.http.get<ServiceDetail>(`${this.baseUrl}/${id}`);
  }

  // ✅ Get reviews for a specific business
  getBusinessReviews(businessId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${environment.apiUrl}/Reviews/business/${businessId}`);
  }

  // ✅ Get all available services (for Find Service page)
  getAllProviders(): Observable<ServiceDetail[]> {
    return this.http.get<ServiceDetail[]>(this.baseUrl);
  }
}
