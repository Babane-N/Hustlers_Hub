import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🟢 Booking model
export interface Booking {
  id: string;
  serviceId: string;
  customerId: string;
  businessId: string;
  bookingDate: Date;
  status: string;

  // Extra details
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;

  // Optional relationships (if API expands them)
  service?: { id: string; title: string };
  customer?: { id: string; fullName: string };
  business?: { id: string; businessName: string };
}

// 🟢 CreateBooking DTO
export interface CreateBookingDto {
  serviceId: string;
  customerId: string;
  businessId: string;
  bookingDate: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://localhost:7018/api/Bookings';

  constructor(private http: HttpClient) { }

  // ✅ CRUD methods

  createBooking(dto: CreateBookingDto): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  getBooking(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  updateBooking(id: string, dto: Partial<CreateBookingDto> & { bookingDate: Date }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  deleteBooking(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ Custom endpoints

  getBookingsByBusiness(businessId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/business/${businessId}`);
  }

  getCustomerBookings(customerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  getProviderBookings(providerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/provider/${providerId}`);
  }
}
