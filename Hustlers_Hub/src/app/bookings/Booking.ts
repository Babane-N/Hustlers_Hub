import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Booking {
  id: number;
  clientName: string;
  clientImage: string;
  service: string;
  date: Date;
  location: string;
  details: string;
}

@Injectable({
  providedIn: 'root'
})

export class BookingProvider
{
  private apiUrl = 'https://localhost:7018/api/Bookings';

  constructor(private http: HttpClient) { }

  getProvider(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }
}
