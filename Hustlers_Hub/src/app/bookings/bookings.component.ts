import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService, Booking } from './BookingService';
import { AuthService } from '../features/side-bar/auth.Service';
import { ActiveServiceContextService } from '../core/active-service-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit, OnDestroy {

  bookings: Booking[] = [];
  isLoading = true;
  errorMessage = '';

  showScheduleModal = false;
  selectedBooking: Booking | null = null;
  selectedScheduleDate = '';

  activeBusinessId: string | null = null;
  userId: string | null = null;
  userRole: string | null = null;

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService,
    private activeServiceContext: ActiveServiceContextService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    // =========================
    // AUTH USER STREAM
    // =========================
    this.subscriptions.add(
      this.authService.user$.subscribe(user => {
        if (!user) {
          this.fail('You must be logged in to view bookings.');
          return;
        }

        this.userId = user.id ?? null;
      })
    );

    // =========================
    // ROLE STREAM
    // =========================
    this.subscriptions.add(
      this.authService.role$.subscribe(role => {
        this.userRole = role?.toLowerCase() ?? null;
        this.tryLoadBookings();
      })
    );

    // =========================
    // ACTIVE BUSINESS STREAM
    // =========================
    this.subscriptions.add(
      this.activeServiceContext.service$.subscribe(business => {

        this.activeBusinessId = business?.id ?? null;

        // ONLY reload if business is available
        if (business) {
          this.tryLoadBookings();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =========================
  // SAFE LOADER
  // =========================
  private tryLoadBookings(): void {

    if (!this.userRole || !this.userId) return;

    this.isLoading = true;

    if (this.userRole === 'business') {

      const businessId = this.activeServiceContext.getActiveBusinessId();

      if (!businessId) {
        this.isLoading = false;
        return; // wait silently (NO ERROR)
      }

      this.loadBusinessBookings(businessId);
      return;
    }

    if (this.userRole === 'customer') {
      this.loadCustomerBookings();
    }
  }

  // =========================
  // LOADERS
  // =========================
  private loadBusinessBookings(businessId: string): void {

    this.bookingService.getBookingsByBusiness(businessId).subscribe({
      next: data => this.handleBookings(data),
      error: err => this.handleError(err)
    });
  }

  private loadCustomerBookings(): void {

    if (!this.userId) return;

    this.bookingService.getBookingsByCustomer(this.userId).subscribe({
      next: data => this.handleBookings(data),
      error: err => this.handleError(err)
    });
  }

  // =========================
  // HELPERS
  // =========================
  private handleBookings(data: Booking[]): void {

    this.bookings = data.map(b => ({
      ...b,
      customerName: b.customerName || 'Unknown Customer',
      businessName: b.businessName || 'Unknown Business',
      description: b.description || 'No description provided'
    }));

    this.isLoading = false;
  }

  private handleError(err: any): void {
    console.error(err);
    this.fail('Failed to load bookings.');
  }

  private fail(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  // =========================
  // UI ACTIONS
  // =========================
  viewBookingDetails(booking: Booking): void {
    this.router.navigate(['/booking-detail', booking.id]);
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
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

  // =========================
  // SCHEDULING
  // =========================
  openScheduleModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.selectedScheduleDate = booking.bookingDate ?? '';
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.selectedBooking = null;
  }

  confirmSchedule(): void {

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

        this.snackBar.open('Booking updated successfully', 'Close', {
          duration: 3000
        });

        this.closeScheduleModal();
      },
      error: () => {
        this.snackBar.open('Failed to update booking', 'Close', {
          duration: 3000
        });
      }
    });
  }
}
