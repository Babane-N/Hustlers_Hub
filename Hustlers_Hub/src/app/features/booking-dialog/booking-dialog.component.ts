import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingService, CreateBookingDto } from './BookingService';
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
    @Inject(MAT_DIALOG_DATA) public data: { serviceId: string },
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (!user) {
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
    const user = JSON.parse(localStorage.getItem('user')!);

    if (!this.bookingDate) {
      this.snackBar.open('Please select a booking date', 'Close', { duration: 3000 });
      return;
    }

    const bookingDto: CreateBookingDto = {
      serviceId: this.data.serviceId,
      customerId: user.userId,
      bookingDate: this.bookingDate.toISOString(),
      description: this.description,
      contactNumber: this.contactNumber,
      location: this.location,
      latitude: this.latitude,
      longitude: this.longitude
    };

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
