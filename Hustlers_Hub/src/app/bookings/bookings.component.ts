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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const businessId = user.businessId || user.id; // ✅ normalize

    if (!businessId) {
      this.errorMessage = 'You must be logged in as a business to view bookings.';
      this.isLoading = false;
      return;
    }

    this.bookingService.getBookingsByBusiness(businessId).subscribe({
      next: (data) => {
        this.bookings = data.map(b => ({
          ...b,
          serviceTitle: b.serviceTitle || b.service?.title || 'Unknown Service',
          customerName: b.customerName || b.customer?.fullName || 'Unknown Customer',
          businessName: b.businessName || b.business?.businessName || 'Unknown Business'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching business bookings:', err);
        this.errorMessage = 'Could not load bookings. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // ✅ Template helpers
  get hasBookings(): boolean {
    return this.bookings.length > 0;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  viewBookingDetails(booking: Booking): void {
    this.router.navigate(['/booking-detail', booking.id]);
  }
}

