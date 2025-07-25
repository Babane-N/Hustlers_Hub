import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  user: string;
  comment: string;
  rating: number; // 1 to 5
}

export interface ServiceDetail {
  id: number;
  businessName: string;
  service: string;
  location: string;
  logUrl: string; // Profile or primary image
  description: string;
  isVerified: boolean;
  reviews: Review[];
  gallery: string[]; // Array of image URLs
}

@Injectable({ providedIn: 'root' })
export class ServiceProvider {
  private baseUrl = 'https://localhost:7018/api/Services'; // ✅ Base API URL

  constructor(private http: HttpClient) { }

  // ✅ Get one service detail by ID
  getServiceDetails(id: string): Observable<ServiceDetail> {
    return this.http.get<ServiceDetail>(`https://localhost:7018/api/Services/detail/${id}`);
  }


  // ✅ Get all services (e.g., for the find-service page)
  getAllProviders(): Observable<ServiceDetail[]> {
    return this.http.get<ServiceDetail[]>(this.baseUrl);
  }
}
