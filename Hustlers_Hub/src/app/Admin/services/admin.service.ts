// src/app/Admin/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PendingBusiness {
  id: string;
  businessName: string;
  description: string;
  category: string;
  location: string;
  logoUrl?: string | null;
  isVerified: boolean;
  isCipcRegistered: boolean;
  cipcNumber: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Change to your actual API base url
  private baseUrl = `${environment.apiUrl}/Businesses`;

  constructor(private http: HttpClient) { }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }

  getApprovedBusinesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/businesses/approved`);
  }


  getPendingBusinesses() {
    return this.http.get<any[]>(this.baseUrl + '/pending');
  }

  approveBusiness(id: number, payload: { verifyBusiness: boolean }) {
    return this.http.post(
      `${this.baseUrl}/approve/${id}`,
      payload
    );
  }

  rejectBusiness(id: string) {
    return this.http.delete(this.baseUrl + `/Reject/${id}`);
  }

  deleteBusiness(id: string) {
    return this.http.delete(`${this.baseUrl}/businesses/${id}`);
  }

  getRecentBookings() {
    return this.http.get<any[]>(`${this.baseUrl}/bookings/recent`);
  }
  getDashboardStats() {
    return this.http.get<any>(this.baseUrl + "/dashboard");
  }

  // Reports
  downloadReportCsv(type: string = 'all') {
    return this.http.get(`${this.baseUrl}/reports/csv?type=${type}`, { responseType: 'blob' });
  }
}
