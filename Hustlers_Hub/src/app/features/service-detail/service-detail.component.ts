import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ServiceProvider, BusinessDetail, Review } from './service.detail';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {

  business: BusinessDetail | null = null;
  reviews: Review[] = [];
  isLoading = true;
  uploadsUrl = environment.uploadsUrl;
  businessId!: string;

  constructor(
    private route: ActivatedRoute,
    private serviceProvider: ServiceProvider,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      console.error('Missing service ID');
      this.isLoading = false;
      return;
    }

    this.businessId = id;     
    this.loadService(id);
  }

  private loadService(businessId: string): void {
    this.serviceProvider.getServiceDetails(businessId).subscribe({
      next: service => {
        // Normalize gallery images and logo
        service.logoUrl = this.normalizeUrl(service.logoUrl);
        service.images = this.normalizeImages(service.images);

        this.business = service;
        this.isLoading = false;

        this.loadReviews(service.businessId);
      },
      error: err => {
        console.error('Failed to load Business', err);
        this.isLoading = false;
      }
    });
  }

  private loadReviews(businessId: string): void {
    this.serviceProvider.getBusinessReviews(businessId).subscribe({
      next: reviews => this.reviews = reviews,
      error: err => console.error('Failed to load reviews', err)
    });
  }

  hideImage(imgUrl: string): void {
    if (this.business && this.business.images) {
      this.business.images = this.business.images.filter(i => i !== imgUrl);
    }
  }

  openBookingDialog(): void {
    if (!this.business?.id) return;

    this.dialog.open(BookingDialogComponent, {
      width: '480px',
      data: { serviceId: this.business.id }
    });
  }

  // 🔹 Make this public so template can access it
  public normalizeUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${this.uploadsUrl.replace(/\/+$/, '')}/${url.replace(/^\/+|uploads\/?/g, '')}`;
  }

  private normalizeImages(images?: string[]): string[] {
    if (!images || !images.length) return [];
    return images
      .map(img => this.normalizeUrl(img))
      .filter((img): img is string => !!img);
  }
}
