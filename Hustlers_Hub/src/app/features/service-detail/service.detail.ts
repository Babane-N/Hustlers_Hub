import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Service + Business details
export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  price: number;
  durationMinutes: number;
  hiddenImage?: boolean;
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
  private uploadsUrl = environment.uploadsUrl;

  constructor(private http: HttpClient) { }

  // 🔧 Normalize image / logo URL
  private normalizeUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    return `${this.uploadsUrl.replace(/\/+$/, '')}/${url.replace(/^\/+|uploads\/?/g, '')}`;
  }

  // Fetch service details by ID (✅ FIXED)
  getServiceDetails(id: string): Observable<ServiceDetail> {
    return this.http
      .get<ServiceDetail>(`${this.baseUrl}/detail/${id}`)
      .pipe(
        map(service => ({
          ...service,
          imageUrl: this.normalizeUrl(service.imageUrl),
          logoUrl: this.normalizeUrl(service.logoUrl)
        }))
      );
  }

  // Fetch reviews for a specific business
  getBusinessReviews(businessId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/business/${businessId}`);
  }

  // Combine service details + reviews
  getServiceWithReviews(id: string): Observable<{ provider: ServiceDetail; reviews: Review[] }> {
    return this.getServiceDetails(id).pipe(
      switchMap(provider =>
        this.getBusinessReviews(provider.businessId).pipe(
          map(reviews => ({ provider, reviews }))
        )
      )
    );
  }

  // Get all providers (✅ also normalized)
  getAllProviders(): Observable<ServiceDetail[]> {
    return this.http.get<ServiceDetail[]>(this.baseUrl).pipe(
      map(services =>
        services.map(service => ({
          ...service,
          imageUrl: this.normalizeUrl(service.imageUrl),
          logoUrl: this.normalizeUrl(service.logoUrl)
        }))
      )
    );
  }
}
