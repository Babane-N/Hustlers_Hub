import { Component, OnInit } from '@angular/core';
import { BookingService, Booking, BookingStatus } from '../../bookings/BookingService';
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
    this.loadBookings();
  }

  loadBookings(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

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
          businessName: b.businessName || b.business?.businessName || 'Unknown Business',
          customerName: b.customerName || b.customer?.fullName || 'You',
          description: b.description || 'No details provided',

          // Show scheduled date if available
          bookingDate: b.bookingDate || null
        }));

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);

        this.snackBar.open(
          'Could not load your bookings. Please try again later.',
          'Close',
          { duration: 3000 }
        );

        this.errorMessage = 'Failed to load bookings.';
        this.isLoading = false;
      }
    });
  }

  markAsComplete(id: string): void {
    this.bookingService.markBookingComplete(id).subscribe({
      next: () => {

        const booking = this.bookings.find(
          b => b.id === id
        );

        if (booking) {
          booking.status = 'Completed';
        }

        this.snackBar.open(
          'Booking marked as completed!',
          'Close',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error(err);

        this.snackBar.open(
          'Failed to mark booking as complete.',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  cancelBooking(id: string): void {

    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    );

    if (!confirmed) {
      return;
    }

    this.bookingService.cancelBooking(id).subscribe({
      next: () => {

        const booking = this.bookings.find(
          b => b.id === id
        );

        if (booking) {
          booking.status = 'Cancelled';
        }

        this.snackBar.open(
          'Booking cancelled successfully.',
          'Close',
          { duration: 3000 }
        );
      },

      error: (err) => {

        console.error(err);

        this.snackBar.open(
          'Failed to cancel booking.',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  get hasBookings(): boolean {
    return this.bookings.length > 0;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';

      case 'confirmed':
        return 'status-confirmed';

      default:
        return '';
    }
  }
}
