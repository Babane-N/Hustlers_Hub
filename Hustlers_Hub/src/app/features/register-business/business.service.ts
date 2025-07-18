import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  constructor(private http: HttpClient) { }

  registerBusiness(businessData: any): Observable<any> {
    return this.http.post('/api/businesses', businessData);
  }
}
