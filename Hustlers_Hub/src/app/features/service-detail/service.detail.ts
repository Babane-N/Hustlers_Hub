import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Service + Business details
export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  price: number;
  durationMinutes: number;

  businessId: string;
  businessName: string;
  logoUrl?: string | null;
  businessLocation: string;
  businessDescription?: string;
  isVerified: boolean;
}

// Reviews
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

  // Fetch service details by ID
  getServiceDetails(id: string): Observable<ServiceDetail> {
    return this.http.get<ServiceDetail>(`${this.baseUrl}/detail/${id}`);
  }

  // Fetch reviews for a specific business
  getBusinessReviews(businessId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/business/${businessId}`);
  }

  // Combine service details + reviews
  getServiceWithReviews(id: string): Observable<{ provider: ServiceDetail; reviews: Review[] }> {
    return this.getServiceDetails(id).pipe(
      map(provider => ({ provider, reviews: [] })), // initialize reviews empty
      // fetch reviews separately
      switchMap(({ provider }) =>
        this.getBusinessReviews(provider.businessId).pipe(
          map(reviews => ({ provider, reviews }))
        )
      )
    );
  }

  getAllProviders(): Observable<ServiceDetail[]> {
    return this.http.get<ServiceDetail[]>(this.baseUrl);
  }
}
