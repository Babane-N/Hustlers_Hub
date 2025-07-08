import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ServiceProvider {
  name: string;
  service: string;
  location: string;
  description: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {
  private apiUrl = 'https://localhost:7018/api/Services';

  constructor(private http: HttpClient) { }

  getProviders(): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(this.apiUrl);
  }
}
