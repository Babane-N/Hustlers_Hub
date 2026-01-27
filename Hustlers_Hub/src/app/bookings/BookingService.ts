// BookingService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed';

export interface Booking {
  id: string;
  bookingDate: string;
  status: BookingStatus;

  description?: string;
  contactNumber?: string;
  location?: string;
  latitude?: number;
  longitude?: number;

  customerName?: string;
  businessName?: string;


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
  private readonly baseUrl = `${environment.apiUrl}/Bookings`;

  constructor(private http: HttpClient) { }

  getBookingsByBusiness(businessId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/business/${businessId}`);
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  scheduleBooking(id: string, bookingDate: Date): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, {
      bookingDate: bookingDate.toISOString(),
      status: 'Confirmed'
    });
  }

  updateBookingStatus(id: string, status: BookingStatus): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/status`, { status });
  }

  updateBooking(
    id: string,
    payload: Partial<Booking>
  ): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${id}`, payload);
  }
}
