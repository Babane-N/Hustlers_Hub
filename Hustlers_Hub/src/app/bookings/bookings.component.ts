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
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private bookingService: BookingProvider
  ) { }

  ngOnInit(): void {
    this.bookingService.getProvider().subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.errorMessage = 'Could not load bookings. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // ✅ Handy getter for template
  get hasBookings(): boolean {
    return this.bookings && this.bookings.length > 0;
  }
}
