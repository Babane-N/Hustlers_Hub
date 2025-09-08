import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Promotion {
  id?: string; // Assuming your backend returns an Id
  title: string;
  description: string;
  postedBy: string;
  expiresAt: Date;
  category: string;
  images: string[]; // Multiple image URLs
}

@Injectable({ providedIn: 'root' })
export class PromotionProvider {
  private apiUrl = 'https://localhost:7018/api/Promotions';

  constructor(private http: HttpClient) { }

  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl);
  }

  postPromotion(formData: FormData): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, formData);
  }
}
