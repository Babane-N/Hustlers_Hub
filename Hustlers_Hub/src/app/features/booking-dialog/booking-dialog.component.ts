import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss']
})
export class BookingDialogComponent {
  bookingDate: Date | null = null;
  notes = '';

  constructor(public dialogRef: MatDialogRef<BookingDialogComponent>) { }

  submitBooking() {
    console.log('Booking submitted:', { date: this.bookingDate, notes: this.notes });
    this.dialogRef.close(); // Close after submission
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
