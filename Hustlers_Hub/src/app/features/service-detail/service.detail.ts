import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { environment }
  from '../../../environments/environment';

// =====================================================
// BUSINESS IMAGE
// =====================================================
export interface BusinessImage {
  id: string;
  imageUrl: string;
}

// =====================================================
// SERVICE + BUSINESS DETAILS
// =====================================================
export interface BusinessDetail {

  id: string;

  title: string;

  description: string;

  category: string;

  price: number;

  durationMinutes: number;

  // Keep for compatibility
  businessId: string;

  businessName: string;

  logoUrl?: string | null;

  // Updated structure
  images?: string[];

  businessLocation: string;

  businessDescription?: string;

  isVerified: boolean;
}

// =====================================================
// REVIEWS
// =====================================================
export interface Review {

  id: string;

  reviewer: string;

  rating: number;

  comment: string;

  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceProvider {

  private baseUrl =
    `${environment.apiUrl}/Businesses`;

  private uploadsUrl =
    environment.uploadsUrl;

  constructor(
    private http: HttpClient
  ) { }

  // =====================================================
  // NORMALIZE IMAGE / LOGO URL
  // =====================================================
  private normalizeUrl(
    url?: string | null
  ): string | null {

    if (!url) {
      return null;
    }

    // Already full URL
    if (url.startsWith('http')) {
      return url;
    }

    return `${this.uploadsUrl.replace(/\/+$/, '')}/${url.replace(/^\/+|uploads\/?/g, '')}`;
  }

  // =====================================================
  // NORMALIZE GALLERY IMAGES
  // Supports:
  // 1. string[]
  // 2. { id, imageUrl }[]
  // =====================================================
  private normalizeImages(
    images?: any[]
  ): string[] {

    if (
      !images ||
      !Array.isArray(images) ||
      !images.length
    ) {
      return [];
    }

    return images
      .map(image => {

        // OLD FORMAT
        if (typeof image === 'string') {
          return this.normalizeUrl(image);
        }

        // NEW FORMAT
        return this.normalizeUrl(
          image?.imageUrl
        );
      })
      .filter(
        (img): img is string => !!img
      );
  }

  // =====================================================
  // GET SERVICES BY BUSINESS
  // =====================================================
  getServicesByBusiness(
    businessId: string
  ): Observable<BusinessDetail[]> {

    return this.http
      .get<BusinessDetail[]>(
        `${this.baseUrl}/business/${businessId}`
      )
      .pipe(
        map(services =>
          services.map(service => ({

            ...service,

            logoUrl:
              this.normalizeUrl(
                service.logoUrl
              ),

            images:
              this.normalizeImages(
                service.images as any[]
              )
          }))
        )
      );
  }

  // =====================================================
  // GET SERVICE DETAILS
  // =====================================================
  getServiceDetails(
    id: string
  ): Observable<BusinessDetail> {

    return this.http
      .get<BusinessDetail>(
        `${this.baseUrl}/${id}`
      )
      .pipe(
        map(service => ({

          ...service,

          // Ensure compatibility
          businessId:
            service.businessId || service.id,

          logoUrl:
            this.normalizeUrl(
              service.logoUrl
            ),

          images:
            this.normalizeImages(
              service.images as any[]
            )
        }))
      );
  }

  // =====================================================
  // GET BUSINESS REVIEWS
  // =====================================================
  getBusinessReviews(
    businessId: string
  ): Observable<Review[]> {

    return this.http.get<Review[]>(
      `${this.baseUrl}/reviews/business/${businessId}`
    );
  }

  // =====================================================
  // SERVICE + REVIEWS COMBO
  // =====================================================
  getServiceWithReviews(
    id: string
  ): Observable<{
    provider: BusinessDetail;
    reviews: Review[];
  }> {

    return this.getServiceDetails(id)
      .pipe(

        switchMap(provider =>

          this.getBusinessReviews(
            provider.businessId || provider.id
          )
            .pipe(

              map(reviews => ({
                provider,
                reviews
              }))
            )
        )
      );
  }

  // =====================================================
  // GET ALL SERVICES
  // =====================================================
  getAllProviders(): Observable<BusinessDetail[]> {

    return this.http
      .get<BusinessDetail[]>(
        this.baseUrl
      )
      .pipe(

        map(services =>

          services.map(service => ({

            ...service,

            businessId:
              service.businessId || service.id,

            logoUrl:
              this.normalizeUrl(
                service.logoUrl
              ),

            images:
              this.normalizeImages(
                service.images as any[]
              )
          }))
        )
      );
  }
}
