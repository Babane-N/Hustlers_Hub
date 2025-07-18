import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking, BookingProvider } from './Booking';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(
    private router: Router,
    private bookingService: BookingProvider
  ) { }

  ngOnInit(): void {
    this.bookingService.getProvider().subscribe(data => {
      this.bookings = data;
    });
  }
}
