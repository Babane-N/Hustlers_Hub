import { HttpClient, HttpParams } from '@angular/common/http';
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

  location?: string;

  latitude?: number;

  longitude?: number;

  // ✅ Smart ranking fields
  distance?: number;

  score?: number;

  logoUrl?: string | null;

  imageUrl?: string | null;

  hiddenImage?: boolean;

  isVerified?: boolean;
}

export interface ProvidersResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: ServiceProvider[];
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

  private baseUrl =
    `${environment.apiUrl}/Businesses`;

  constructor(
    private http: HttpClient
  ) { }

  // =====================================================
  // ✅ FETCH PROVIDERS WITH LOCATION
  // =====================================================
  getProviders(
    latitude?: number,
    longitude?: number
  ): Observable<ProvidersResponse> {

    let params = new HttpParams();

    if (
      latitude !== undefined &&
      longitude !== undefined
    ) {
      params = params
        .set('lat', latitude.toString())
        .set('lng', longitude.toString());
    }

    return this.http.get<ProvidersResponse>(
      `${this.baseUrl}/public`,
      { params }
    );
  }

  // =====================================================
  // ✅ FETCH SINGLE BUSINESS DETAILS
  // =====================================================
  getServiceDetails(
    serviceId: string
  ): Observable<ServiceProvider> {

    return this.http.get<ServiceProvider>(
      `${this.baseUrl}/${serviceId}`
    );
  }

  // =====================================================
  // ✅ FETCH BUSINESS REVIEWS
  // =====================================================
  getBusinessReviews(
    businessId: string
  ): Observable<Review[]> {

    return this.http.get<Review[]>(
      `${environment.apiUrl}/Reviews/business/${businessId}`
    );
  }
}
