import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Promotion {
  title: string;
  description: string;
  imageUrl: string;
  postedBy: string;
  expires: Date;
  category: string;
}

@Injectable({ providedIn: 'root' })

export class PromotionProvider {

  private apiUrl = 'https://localhost:7018/api/Promotions';
  constructor(
    private http: HttpClient) { }

  getPromotion(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl)
  }

  postPromotion(promotion: any): Observable<any> {
    return this.http.post('/api/Promations', promotion);
  }
}
