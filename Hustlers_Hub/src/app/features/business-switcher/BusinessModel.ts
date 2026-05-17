import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  // GET USER BUSINESSES
  // =====================================================
  getUserBusinesses(
    userId: string
  ): Observable<Business[]> {

    return this.http.get<Business[]>(
      `${this.businessUrl}/user/${userId}`
    );
  }

  // =====================================================
  // CREATE BUSINESS
  // =====================================================
  createBusiness(
    business: Business
  ): Observable<Business> {

    return this.http.post<Business>(
      this.businessUrl,
      business
    );
  }

  // =====================================================
  // GET SINGLE BUSINESS
  // =====================================================
  getBusinessById(
    id: string
  ): Observable<Business> {

    return this.http.get<Business>(
      `${this.businessUrl}/${id}`
    );
  }

  // =====================================================
  // GET PUBLIC BUSINESSES
  // =====================================================
  getApprovedBusinesses(): Observable<Business[]> {

    return this.http.get<Business[]>(
      `${this.businessUrl}/public`
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
