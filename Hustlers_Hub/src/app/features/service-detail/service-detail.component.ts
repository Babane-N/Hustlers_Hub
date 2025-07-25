import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceDetail, ServiceProvider } from './service.detail';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  provider!: ServiceDetail;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private serviceProvider: ServiceProvider
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // 🔁 use string, not number

    if (!id) {
      this.error = 'Invalid service provider ID.';
      this.isLoading = false;
      return;
    }

    this.serviceProvider.getServiceDetails(id).subscribe({
      next: (data) => {
        this.provider = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Could not load service provider.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  openBookingDialog(serviceId: number): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.role) {
      alert('Please log in to book a service.');
      this.router.navigate(['/login']);
      return;
    }

    this.dialog.open(BookingDialogComponent, {
      data: { serviceId }
    });
  }
}
