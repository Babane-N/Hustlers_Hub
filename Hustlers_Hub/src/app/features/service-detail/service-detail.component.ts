import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceDetail, Review, ServiceProvider } from './service.detail';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  environment = environment;
  provider: ServiceDetail & { hiddenImage?: boolean } | null = null; // include hiddenImage dynamically
  reviews: Review[] = [];
  uploadsUrl = environment.uploadsUrl;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceProvider
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProvider(id);
    } else {
      console.error('Service ID is missing in route.');
      this.isLoading = false;
    }
  }

  private loadProvider(serviceId: string): void {
    this.serviceService.getServiceDetails(serviceId).subscribe({
      next: (service) => {
        if (service) {
          // Fix image URLs
          service.logoUrl = service.logoUrl
            ? service.logoUrl.startsWith('/uploads')
              ? `${this.uploadsUrl.replace(/\/+$/, '')}${service.logoUrl}`
              : service.logoUrl.startsWith('http')
                ? service.logoUrl
                : `${this.uploadsUrl.replace(/\/+$/, '')}/${service.logoUrl.replace(/^\/+/, '')}`
            : null;

          service.logoUrl = service.imageUrl
            ? service.imageUrl.startsWith('/uploads')
              ? `${this.uploadsUrl.replace(/\/+$/, '')}${service.imageUrl}`
              : service.imageUrl.startsWith('http')
                ? service.imageUrl
                : `${this.uploadsUrl.replace(/\/+$/, '')}/${service.imageUrl.replace(/^\/+/, '')}`
            : null;
        }

        this.provider = service;

        if (service.businessId) {
          this.loadReviews(service.businessId);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Failed to load service:', err);
        this.isLoading = false;
      }
    });
  }

  private loadReviews(businessId: string): void {
    this.serviceService.getBusinessReviews(businessId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        this.isLoading = false;
      }
    });
  }

  hideImage(): void {
    if (this.provider) this.provider.hiddenImage = true;
  }

  getServiceImage(): string | null {
    if (!this.provider || !this.provider.imageUrl || this.provider.hiddenImage) return null;
    return this.provider.imageUrl;
  }

  openBookingDialog(serviceId: string): void {
    console.log('Open booking dialog for service ID:', serviceId);
  }
}
