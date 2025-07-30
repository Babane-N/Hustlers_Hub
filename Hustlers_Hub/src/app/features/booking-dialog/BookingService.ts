import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface CreateBookingDto {
  serviceId: string;
  customerId: string;
  providerId: string;
  bookingDate: Date;
}


@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = 'https://localhost:7018/api/Bookings';

  constructor(private http: HttpClient) { }

  createBooking(dto: CreateBookingDto) {
    return this.http.post(this.baseUrl, dto);
  }

  // Optionally, you can add more methods here (get bookings, update, etc.)
}
