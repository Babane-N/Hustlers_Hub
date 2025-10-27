// BookingService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Booking {
  id: string;
  bookingDate: string;
  status: string;

  // 🔹 Optional extra fields from backend
  description?: string;
  contactNumber?: string;
  location?: string;
  latitude?: number;
  longitude?: number;

  // 🔹 Flattened fields (if API projects them)
  serviceTitle?: string;
  customerName?: string;
  businessName?: string;

  // 🔹 Nested relationships (if API includes them)
  service?: { id: string; title: string };
  customer?: { id: string; fullName: string };
  business?: { id: string; businessName: string };
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = `${environment.apiUrl}/Bookings`;

  constructor(private http: HttpClient) { }

  getBookingsByBusiness(businessId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/business/${businessId}`);
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/customer/${customerId}`);
  }
}
