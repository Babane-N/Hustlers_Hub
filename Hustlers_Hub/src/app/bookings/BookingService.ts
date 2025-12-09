// BookingService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Booking {
  id: string;
  bookingDate: string;
  status: string;

  // 🔹 Extra fields from backend
  description?: string;
  contactNumber?: string;
  location?: string;
  latitude?: number;
  longitude?: number;

  // 🔹 Flattened fields (if API sends them)
  serviceTitle?: string;
  customerName?: string;
  businessName?: string;

  // 🔹 Nested relationships
  service?: {
    id: string;
    title: string;
  };

  customer?: {
    id: string;
    fullName: string;
  };

  business?: {
    id: string;
    businessName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = `${environment.apiUrl}/Bookings`;

  constructor(private http: HttpClient) { }

  /**
   * Get bookings for a business
   */
  getBookingsByBusiness(businessId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/business/${businessId}`);
  }

  /**
   * Get bookings created by a specific customer
   */
  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/customer/${customerId}`);
  }


  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  scheduleBooking(id: string, newDate: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, {
      bookingDate: newDate,
      status: 'Confirmed'
    });
  }

  updateBookingStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, { status });
  }
}
