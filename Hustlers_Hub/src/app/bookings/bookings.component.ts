import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService, Booking } from './BookingService';
import { AuthService } from '../features/side-bar/auth.Service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = true;
  errorMessage = '';

  // Scheduling modal state
  showScheduleModal = false;
  selectedBooking: Booking | null = null;
  selectedScheduleDate: string = '';

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'You must be logged in to view bookings.';
      this.isLoading = false;
      return;
    }

    const role = this.authService.getRole();
    const userId = this.authService.getUserId();

    if (!userId) {
      this.errorMessage = 'User ID not found. Please log in again.';
      this.isLoading = false;
      return;
    }

    if (role?.toLowerCase() === 'business') {
      this.bookingService.getBookingsByBusiness(userId).subscribe({
        next: data => this.handleBookings(data),
        error: err => this.handleError(err)
      });

    } else if (role?.toLowerCase() === 'customer') {
      this.bookingService.getBookingsByCustomer(userId).subscribe({
        next: data => this.handleBookings(data),
        error: err => this.handleError(err)
      });

    } else {
      this.errorMessage = 'Unknown user type. Access denied.';
      this.isLoading = false;
    }
  }


  private handleBookings(data: Booking[]) {
    this.bookings = data.map(b => ({
      ...b,
      serviceTitle: b.serviceTitle || b.service?.title || 'Unknown Service',
      customerName: b.customerName || b.customer?.fullName || 'Unknown Customer',
      businessName: b.businessName || b.business?.businessName || 'Unknown Business',
      description: b.description || 'No details provided'
    }));
    this.isLoading = false;
  }

  private handleError(err: any) {
    console.error('Error fetching bookings:', err);
    this.errorMessage = 'Failed to load bookings.';
    this.isLoading = false;
    this.snackBar.open('Could not load bookings. Please try again later.', 'Close', { duration: 3000 });
  }

  viewBookingDetails(booking: Booking): void {
    this.router.navigate(['/booking-detail', booking.id]);
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

  get hasBookings(): boolean {
    return this.bookings.length > 0;
  }

  // -------------------------------
  // Scheduling modal functions
  // -------------------------------
  openScheduleModal(booking: Booking) {
    this.selectedBooking = booking;
    this.selectedScheduleDate = booking.bookingDate;
    this.showScheduleModal = true;
  }

  closeScheduleModal() {
    this.showScheduleModal = false;
    this.selectedBooking = null;
    this.selectedScheduleDate = '';
  }

  confirmSchedule() {
    if (!this.selectedBooking) return;

    this.bookingService.scheduleBooking(this.selectedBooking.id, this.selectedScheduleDate)
      .subscribe({
        next: updatedBooking => {
          const index = this.bookings.findIndex(b => b.id === updatedBooking.id);
          if (index > -1) this.bookings[index].bookingDate = updatedBooking.bookingDate;

          this.snackBar.open('Booking scheduled successfully', 'Close', { duration: 3000 });
          this.closeScheduleModal();
        },
        error: err => {
          console.error('Error scheduling booking:', err);
          this.snackBar.open('Failed to schedule booking', 'Close', { duration: 3000 });
        }
      });
  }
}
