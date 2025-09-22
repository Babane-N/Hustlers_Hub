import { Component, OnInit } from '@angular/core';
import { BookingService, Booking } from '../../bookings/BookingService';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // ✅ Normalize customerId
    const customerId = user.userId || user.id;

    if (!customerId) {
      this.errorMessage = 'You must be logged in to view your bookings.';
      this.isLoading = false;
      return;
    }

    this.bookingService.getBookingsByCustomer(customerId).subscribe({
      next: (data) => {
        this.bookings = data.map(b => ({
          ...b,
          serviceTitle: b.serviceTitle || b.service?.title || 'Unknown Service',
          businessName: b.businessName || b.business?.businessName || 'Unknown Business',
          customerName: b.customerName || b.customer?.fullName || 'You',
          description: b.description || 'No details provided'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.snackBar.open('Could not load your bookings. Please try again later.', 'Close', { duration: 3000 });
        this.errorMessage = 'Failed to load bookings.';
        this.isLoading = false;
      }
    });
  }

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
}
