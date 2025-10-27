import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Promotion {
  id?: string; // Assuming your backend returns an Id
  title: string;
  description: string;
  postedBy: string;
  expires: Date;
  category: string;
  images: string[]; // Multiple image URLs
}

@Injectable({ providedIn: 'root' })
export class PromotionProvider {
  private baseUrl = `${environment.apiUrl}/Promotions`;

  constructor(private http: HttpClient) { }

  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.baseUrl);
  }

  postPromotion(formData: FormData): Observable<Promotion> {
    return this.http.post<Promotion>(this.baseUrl, formData);
  }
}
