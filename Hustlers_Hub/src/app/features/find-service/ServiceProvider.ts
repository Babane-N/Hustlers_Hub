import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServiceProvider {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
  durationMinutes: number;
  businessName: string;
  businessLocation: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string | null; // ✅ allow null
}


@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {
  private baseUrl = `${environment.apiUrl}/Busineses`;
  constructor(private http: HttpClient) { }

  getProviders(): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(this.baseUrl);
  }
}
