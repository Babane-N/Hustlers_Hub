import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ServiceProvider, ServiceDetail, Review } from './service.detail';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {

  service: ServiceDetail | null = null;
  reviews: Review[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private serviceProvider: ServiceProvider,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');

    if (!serviceId) {
      console.error('Missing service ID');
      this.isLoading = false;
      return;
    }

    this.loadService(serviceId);
  }

  private loadService(serviceId: string): void {
    this.serviceProvider.getServiceDetails(serviceId).subscribe({
      next: service => {
        this.service = {
          ...service,
          hiddenImage: false // UI-only flag
        };

        this.isLoading = false;
        this.loadReviews(service.businessId);
      },
      error: err => {
        console.error('Failed to load service', err);
        this.isLoading = false;
      }
    });
  }

  private loadReviews(businessId: string): void {
    this.serviceProvider.getBusinessReviews(businessId).subscribe({
      next: reviews => (this.reviews = reviews),
      error: err => console.error('Failed to load reviews', err)
    });
  }

  hideImage(): void {
    if (this.service) {
      this.service.hiddenImage = true;
    }
  }

  openBookingDialog(): void {
    if (!this.service?.id) return;

    this.dialog.open(BookingDialogComponent, {
      width: '480px',
      data: { serviceId: this.service.id }
    });
  }
}

