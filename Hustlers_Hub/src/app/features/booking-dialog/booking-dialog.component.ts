import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (!user) {
      this.dialogRef.close();
      this.router.navigate(['/login']);
    }
  }

  submitBooking() {
    console.log('Booking submitted:', { date: this.bookingDate, notes: this.notes });
    this.dialogRef.close(); // Close after submission
  }

  closeDialog() {
    this.dialogRef.close();
  }
}


