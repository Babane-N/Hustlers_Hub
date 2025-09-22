// BookingService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'https://localhost:7018/api/Bookings';

  constructor(private http: HttpClient) { }

  getBookingsByBusiness(businessId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/business/${businessId}`);
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/customer/${customerId}`);
  }
}
