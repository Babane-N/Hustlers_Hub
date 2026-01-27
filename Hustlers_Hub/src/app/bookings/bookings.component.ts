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

  // Scheduling modal
  showScheduleModal = false;
  selectedBooking: Booking | null = null;
  selectedScheduleDate = '';

  // Active business ID
  activeBusinessId: string | null = null;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.fail('You must be logged in to view bookings.');
      return;
    }

    const role = this.authService.getRole()?.toLowerCase();

    if (role === 'business') {
      // Try to get activeBusinessId from localStorage
      this.activeBusinessId = localStorage.getItem('activeBusinessId');

      if (!this.activeBusinessId) {
        this.fail('No active business selected.');
        return;
      }

      this.loadBusinessBookings();
    } else if (role === 'customer') {
      this.loadCustomerBookings();
    } else {
      this.fail('Unknown user type.');
    }
  }

  // =============================
  // Loaders
  // =============================

  private loadBusinessBookings() {
    if (!this.activeBusinessId) return;

    this.bookingService.getBookingsByBusiness(this.activeBusinessId).subscribe({
      next: bookings => this.handleBookings(bookings),
      error: err => this.handleError(err)
    });
  }

  private loadCustomerBookings() {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.fail('User session expired. Please log in again.');
      return;
    }

    this.bookingService.getBookingsByCustomer(userId).subscribe({
      next: bookings => this.handleBookings(bookings),
      error: err => this.handleError(err)
    });
  }

  // =============================
  // Helpers
  // =============================

  private handleBookings(data: Booking[]) {
    this.bookings = data.map(b => ({
      ...b,
      customerName: b.customerName || 'Unknown Customer',
      businessName: b.businessName || 'Unknown Business',
      description: b.description || 'No description provided'
    }));

    this.isLoading = false;
  }

  private handleError(err: any) {
    console.error(err);
    this.fail('Failed to load bookings.');
    this.snackBar.open('Could not load bookings.', 'Close', { duration: 3000 });
  }

  private fail(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
  }

  // =============================
  // UI Actions
  // =============================

  viewBookingDetails(booking: Booking) {
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

  // =============================
  // Scheduling
  // =============================

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

    this.bookingService.updateBooking(this.selectedBooking.id, {
      bookingDate: this.selectedScheduleDate,
      status: this.selectedBooking.status,
      description: this.selectedBooking.description,
      contactNumber: this.selectedBooking.contactNumber,
      location: this.selectedBooking.location,
      latitude: this.selectedBooking.latitude,
      longitude: this.selectedBooking.longitude
    }).subscribe({
      next: updated => {
        const index = this.bookings.findIndex(b => b.id === updated.id);
        if (index > -1) this.bookings[index] = updated;

        this.snackBar.open('Booking updated successfully', 'Close', { duration: 3000 });
        this.closeScheduleModal();
      },
      error: () => {
        this.snackBar.open('Failed to update booking', 'Close', { duration: 3000 });
      }
    });
  }
}
