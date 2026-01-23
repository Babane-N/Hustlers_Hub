import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// =============================
// 📦 Service + Business details
// =============================
export interface BusinessDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  durationMinutes: number;
  businessId: string;
  businessName: string;
  logoUrl?: string | null;
  images?: string[];
  businessLocation: string;
  businessDescription?: string;
  isVerified: boolean;
}

// =============================
// ⭐ Reviews
// =============================
export interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceProvider {
  private baseUrl = `${environment.apiUrl}/Businesses`;
  private uploadsUrl = environment.uploadsUrl;

  constructor(private http: HttpClient) { }

  // 🔧 Normalize image / logo URL
  private normalizeUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${this.uploadsUrl.replace(/\/+$/, '')}/${url.replace(/^\/+|uploads\/?/g, '')}`;
  }

  // 🔧 Normalize gallery images
  private normalizeImages(images?: string[]): string[] {
    if (!images || !images.length) return [];
    return images
      .map(img => this.normalizeUrl(img))
      .filter((img): img is string => !!img);
  }

  // 📋 Get services by business
  getServicesByBusiness(businessId: string): Observable<BusinessDetail[]> {
    return this.http
      .get<BusinessDetail[]>(`${this.baseUrl}/business/${businessId}`)
      .pipe(
        map(services =>
          services.map(service => ({
            ...service,
            logoUrl: this.normalizeUrl(service.logoUrl),
            images: this.normalizeImages(service.images)
          }))
        )
      );
  }


  // 📌 Get service details
  getServiceDetails(id: string): Observable<BusinessDetail> {
    return this.http
      .get<BusinessDetail>(`${this.baseUrl}/${id}`)
      .pipe(
        map(service => ({
          ...service,
          logoUrl: this.normalizeUrl(service.logoUrl),
          images: this.normalizeImages(service.images)
        }))
      );
  }

  // ⭐ Get business reviews
  getBusinessReviews(businessId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/business/${businessId}`);
  }

  // 🔗 Service + reviews combo
  getServiceWithReviews(
    id: string
  ): Observable<{ provider: BusinessDetail; reviews: Review[] }> {
    return this.getServiceDetails(id).pipe(
      switchMap(provider =>
        this.getBusinessReviews(provider.businessId).pipe(
          map(reviews => ({ provider, reviews }))
        )
      )
    );
  }

  // 📋 Get all services (list)
  getAllProviders(): Observable<BusinessDetail[]> {
    return this.http.get<BusinessDetail[]>(this.baseUrl).pipe(
      map(services =>
        services.map(service => ({
          ...service,
          logoUrl: this.normalizeUrl(service.logoUrl),
          images: this.normalizeImages(service.images)
        }))
      )
    );
  }
}
