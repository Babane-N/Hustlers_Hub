import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateBookingDto, BookingService } from './BookingService';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss']
})
export class BookingDialogComponent implements OnInit {
  bookingDate: Date | null = null;
  notes = '';

  constructor(
    public dialogRef: MatDialogRef<BookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serviceId: string, providerId: string },
    private bookingService: BookingService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (!user) {
      this.dialogRef.close();
      this.router.navigate(['/login']);
    }
  }

  submitBooking() {
    const user = JSON.parse(localStorage.getItem('user')!);
    const bookingDto: CreateBookingDto = {
      serviceId: this.data.serviceId,
      providerId: this.data.providerId,
      customerId: user.id,
      bookingDate: this.bookingDate!
    };

    this.bookingService.createBooking(bookingDto).subscribe({
      next: () => {
        this.snackBar.open('Booking submitted successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Failed to submit booking', 'Close', { duration: 3000 });
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

