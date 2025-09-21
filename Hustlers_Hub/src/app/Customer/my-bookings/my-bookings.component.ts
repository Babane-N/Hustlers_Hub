import { Component, OnInit } from '@angular/core';
import { BookingService, Booking } from './BookingService';
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

    if (!user?.id) {
      this.errorMessage = 'You must be logged in to view your bookings.';
      this.isLoading = false;
      return;
    }

    this.bookingService.getCustomerBookings(user.id).subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.errorMessage = 'Could not load your bookings. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  get hasBookings(): boolean {
    return this.bookings && this.bookings.length > 0;
  }

  // ✅ Convert booking status to chip color
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
