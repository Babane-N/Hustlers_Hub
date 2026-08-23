import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// =====================================================
// BUSINESS IMAGE MODEL
// =====================================================
export interface BusinessImage {
  id: string;
  imageUrl: string;
}

// =====================================================
// BUSINESS MODEL
// =====================================================
export interface Business {

  id: string;

  businessName: string;

  category: string;

  description: string;

  // Logo
  logoUrl?: string;

  location: string;

  userId: string;

  businessType?: string;

  isApproved?: boolean;

  isVerified?: boolean;

  latitude?: number;

  longitude?: number;

  // Gallery Images
  images?: BusinessImage[];
}

// =====================================================
// BUSINESS SERVICE
// =====================================================
@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  private businessUrl =
    `${environment.apiUrl}/Businesses`;

  constructor(
    private http: HttpClient
  ) { }

  // =====================================================
  // IMAGE URL HELPER
  // =====================================================
  private getImageUrl(
    url: string | undefined
  ): string {

    if (!url) {
      return '';
    }

    // Already a complete URL
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const uploadsUrl =
      environment.uploadsUrl.replace(/\/+$/, '');

    const cleanUrl =
      url
        .replace(/^\/+/, '')
        .replace(/^uploads\/?/i, '');

    return `${uploadsUrl}/${cleanUrl}`;
  }

  // =====================================================
  // MAP BUSINESS IMAGES
  // =====================================================
  private mapBusinessImages(
    business: Business
  ): Business {

    return {
      ...business,

      logoUrl: business.logoUrl
        ? this.getImageUrl(business.logoUrl)
        : business.logoUrl,

      images: (business.images ?? []).map(image => ({
        ...image,
        imageUrl: this.getImageUrl(image.imageUrl)
      }))
    };
  }

  // =====================================================
  // GET USER BUSINESSES
  // =====================================================
  getUserBusinesses(
    userId: string
  ): Observable<Business[]> {

    return this.http
      .get<Business[]>(
        `${this.businessUrl}/user/${userId}`
      )
      .pipe(
        map(businesses =>
          businesses.map(business =>
            this.mapBusinessImages(business)
          )
        )
      );
  }

  // =====================================================
  // CREATE BUSINESS
  // =====================================================
  createBusiness(
    business: Business
  ): Observable<Business> {

    return this.http
      .post<Business>(
        this.businessUrl,
        business
      )
      .pipe(
        map(business =>
          this.mapBusinessImages(business)
        )
      );
  }

  // =====================================================
  // GET SINGLE BUSINESS
  // =====================================================
  getBusinessById(
    id: string
  ): Observable<Business> {

    return this.http
      .get<Business>(
        `${this.businessUrl}/${id}`
      )
      .pipe(
        map(business =>
          this.mapBusinessImages(business)
        )
      );
  }

  // =====================================================
  // GET PUBLIC BUSINESSES
  // =====================================================
  getApprovedBusinesses(): Observable<Business[]> {

    return this.http
      .get<Business[]>(
        `${this.businessUrl}/public`
      )
      .pipe(
        map(businesses =>
          businesses.map(business =>
            this.mapBusinessImages(business)
          )
        )
      );
  }

  // =====================================================
  // DELETE BUSINESS IMAGE
  // =====================================================
  deleteBusinessImage(
    imageId: string
  ): Observable<any> {

    return this.http.delete(
      `${this.businessUrl}/images/${imageId}`
    );
  }
}
