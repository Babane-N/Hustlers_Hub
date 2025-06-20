import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component'; // Adjust the path if needed

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  provider: any;

  providers = [
    {
      name: 'Lebo Dlamini',
      service: 'Electrician',
      location: 'Johannesburg',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      description: 'Specialist in home wiring and appliance repairs.',
      reviews: [
        { user: 'Sipho', comment: 'Excellent service, quick and neat!', rating: 5 },
        { user: 'Noma', comment: 'Reliable and professional.', rating: 4 }
      ],
      gallery: [
        'https://source.unsplash.com/400x300/?electrician',
        'https://source.unsplash.com/400x300/?wiring',
        'https://source.unsplash.com/400x300/?tools'
      ]
    },
    // More provider data here...
  ];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    // Your logic to initialize the provider data
    const id = 0; // Example, change to dynamic fetching if necessary
    this.provider = this.providers[id];
  }

  openBookingDialog(): void {
    const dialogRef = this.dialog.open(BookingDialogComponent, {
      width: '400px',
      data: { provider: this.provider }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
    });
  }
}
