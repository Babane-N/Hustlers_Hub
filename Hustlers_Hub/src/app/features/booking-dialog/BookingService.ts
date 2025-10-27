import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Booking {
  id: string;
  bookingDate: string;
  status: string;
  customerName?: string;
  serviceTitle?: string;
  businessName?: string;
  description?: string;
  contactNumber?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

// ✅ Export DTO so components can import it
export interface CreateBookingDto {
  serviceId: string;
  customerId: string;
  bookingDate: string;
  description?: string;
  contactNumber?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = `${environment.apiUrl}/Bookings`;

  constructor(private http: HttpClient) { }

  createBooking(dto: CreateBookingDto): Observable<any> {
    return this.http.post(this.baseUrl, dto);
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  getBookingsByBusiness(businessId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/business/${businessId}`);
  }
}
