import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService, Booking } from './BookingService';

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
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {
    this.isLoading = true;

    // ✅ Get logged-in user from localStorage
    const user = localStorage.getItem('user');
    if (!user) {
      this.errorMessage = 'You must be logged in to view bookings.';
      this.isLoading = false;
      return;
    }

    const parsedUser = JSON.parse(user);
    const providerId = parsedUser?.businessId || parsedUser?.id; // fallback

    if (!providerId) {
      this.errorMessage = 'Provider information is missing.';
      this.isLoading = false;
      return;
    }

    // ✅ Call API with providerId
    this.bookingService.getProviderBookings(providerId).subscribe({
      next: (data) => {
        this.bookings = data.map(b => ({
          ...b,
          serviceName: b.service?.title || 'Unknown Service',
          customerName: b.customer?.fullName || 'Unknown Customer',
          providerName: b.business?.businessName || 'Unknown Provider',
          location: b.location || 'Not provided'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.errorMessage = 'Could not load bookings. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // ✅ Template helper
  get hasBookings(): boolean {
    return this.bookings.length > 0;
  }

  viewBookingDetails(booking: Booking): void {
    this.router.navigate(['/booking-detail', booking.id]);
  }
}
