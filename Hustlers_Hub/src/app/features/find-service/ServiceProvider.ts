import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServiceProvider {
  id: string;
  title: string;
  category: string;
  description?: string;
  price: number;
  durationMinutes: number;
  businessId?: string;
  businessName: string;
  businessLocation?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string | null;
  imageUrl?: string | null;   // ✅ consistent with find-service
  hiddenImage?: boolean;      // ✅ for broken image handling
  isVerified?: boolean;
}

export interface Review {
  id: string;
  businessId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {
  private baseUrl = `${environment.apiUrl}/Businesses/public`;

  constructor(private http: HttpClient) { }

  // ✅ Fetch all providers (used in FindServiceComponent)
  getProviders(): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(this.baseUrl);
  }

  // ✅ Fetch service details by ID (used in ServiceDetailComponent)
  getServiceDetails(serviceId: string): Observable<ServiceProvider> {
    return this.http.get<ServiceProvider>(`${this.baseUrl}/detail/${serviceId}`);
  }

  // ✅ Fetch business reviews by businessId (used in ServiceDetailComponent)
  getBusinessReviews(businessId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/business/${businessId}`);
  }

}

