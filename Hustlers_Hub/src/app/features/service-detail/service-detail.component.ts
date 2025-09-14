import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { ServiceProvider, ServiceDetail, Review } from './service.detail';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  provider!: ServiceDetail;
  reviews: Review[] = [];
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private serviceProvider: ServiceProvider
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Invalid service provider ID.';
      this.isLoading = false;
      return;
    }

    // ✅ Load service details
    this.serviceProvider.getServiceDetails(id).subscribe({
      next: (data) => {
        this.provider = data;
        this.isLoading = false;

        // After provider is loaded, fetch reviews (needs businessId → same as service.businessId or provider.id depending on backend)
        this.loadReviews(this.provider.id);
      },
      error: (err) => {
        this.error = 'Could not load service provider.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // ✅ Load reviews for business
  loadReviews(businessId: string): void {
    this.serviceProvider.getBusinessReviews(businessId).subscribe({
      next: (data) => {
        this.reviews = data;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
      }
    });
  }

  // ✅ Booking dialog
  openBookingDialog(serviceId: string): void {
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
