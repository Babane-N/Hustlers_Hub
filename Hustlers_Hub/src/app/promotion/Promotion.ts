import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Promotion {
  id?: string; // Assuming your backend returns an Id
  title: string;
  description: string;
  postedBy: string;
  expiresAt: Date;
  category: string;
  images: string[]; // Multiple image URLs
}
interface PromotionsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Promotion[];
}

@Injectable({ providedIn: 'root' })
export class PromotionProvider {
  private baseUrl = `${environment.apiUrl}/Promotions`

  constructor(private http: HttpClient) { }

  getPromotions(): Observable<PromotionsResponse> {
    return this.http.get<PromotionsResponse>(this.baseUrl);
  }

  postPromotion(formData: FormData): Observable<Promotion> {
    return this.http.post<Promotion>(this.baseUrl, formData);
  }
}
