import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingService, CreateBookingDto } from './BookingService'; // ✅ fixed import
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss']
})
export class BookingDialogComponent implements OnInit, AfterViewInit {
  bookingDate: Date | null = null;
  description = '';
  contactNumber = '';
  location = '';
  latitude?: number;
  longitude?: number;

  constructor(
    private dialogRef: MatDialogRef<BookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { businessId: string },
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const customerId = user.userId || user.id;  // ✅ normalize

    if (!customerId) {
      this.snackBar.open('You must be logged in to create a booking', 'Close', { duration: 3000 });
      this.dialogRef.close();
    }
  }

  ngAfterViewInit(): void {
    const input = document.getElementById('placeAutocomplete') as HTMLInputElement;
    if (input && (window as any).google) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(input);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        this.location = place.formatted_address || '';
        this.latitude = place.geometry?.location?.lat();
        this.longitude = place.geometry?.location?.lng();
      });
    }
  }

  submitBooking(): void {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      this.snackBar.open('You must be logged in to book a service', 'Close', { duration: 3000 });
      this.dialogRef.close();
      return;
    }

    const user = JSON.parse(userRaw);

    // 🔑 Normalize customerId (support both id and userId)
    const customerId = user.userId || user.id;

    if (!this.bookingDate) {
      this.snackBar.open('Please select a booking date', 'Close', { duration: 3000 });
      return;
    }

    const bookingDto: CreateBookingDto = {
      businessId: this.data.businessId,
      customerId: customerId,
      bookingDate: this.bookingDate.toISOString(),
      description: this.description,
      contactNumber: this.contactNumber,
      location: this.location,
      latitude: this.latitude,
      longitude: this.longitude
    };

    console.log("📤 Booking DTO sending:", bookingDto); // 🔍 Debug log

    this.bookingService.createBooking(bookingDto).subscribe({
      next: () => {
        this.snackBar.open('Booking submitted successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Booking submission error:', err);
        this.snackBar.open('Failed to submit booking', 'Close', { duration: 3000 });
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
