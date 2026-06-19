import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  category: string;
  postedById: string;
  postedByName?: string;
  businessName?: string;
  isBoosted: boolean;
  createdAt: string;
  expiresAt: string;
  images?: string[];
}

interface PromotionsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Promotion[];
}

@Injectable({
  providedIn: 'root'
})
export class PromotionProvider {

  private baseUrl = `${environment.apiUrl}/Promotions`;

  constructor(
    private http: HttpClient
  ) { }

  private getImageUrl(imagePath: string): string {

    if (!imagePath) {
      return '';
    }

    return imagePath.startsWith('http')
      ? imagePath
      : `https://hustlershub-b4gsheczcebvgbew.southafricanorth-01.azurewebsites.net${imagePath}`;
  }

  private mapPromotionImages(
    promotion: Promotion
  ): Promotion {

    return {
      ...promotion,

      images: (promotion.images ?? []).map(img =>
        this.getImageUrl(img)
      )
    };
  }

  getPromotions(): Observable<PromotionsResponse> {

    return this.http
      .get<PromotionsResponse>(this.baseUrl)
      .pipe(
        map(response => ({

          ...response,

          data: response.data.map(p =>
            this.mapPromotionImages(p)
          )
        }))
      );
  }

  postPromotion(
    formData: FormData
  ): Observable<Promotion> {

    return this.http.post<Promotion>(
      this.baseUrl,
      formData
    );
  }

  getMyPromotions(
    userId: string
  ): Observable<Promotion[]> {

    return this.http
      .get<Promotion[]>(
        `${this.baseUrl}/user/${userId}`
      )
      .pipe(
        map(promotions =>
          promotions.map(p =>
            this.mapPromotionImages(p)
          )
        )
      );
  }

  updatePromotion(
    id: string,
    data: any
  ): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  deletePromotion(
    id: string
  ): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/${id}`
    );
  }
}
