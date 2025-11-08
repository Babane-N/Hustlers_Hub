import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceProvider } from '../find-service/ServiceProvider';
import { ServiceProviderService } from '../find-service/ServiceProvider';
import { environment } from '../../../environments/environment';

export interface Review {
  id: string;
  businessId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerName: string;
}

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  environment = environment;
  provider: ServiceProvider | null = null;
  reviews: Review[] = [];
  uploadsUrl = environment.uploadsUrl;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private providerService: ServiceProviderService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadService(id);
    } else {
      console.error('Missing service ID in route.');
      this.isLoading = false;
    }
  }

  private loadService(serviceId: string): void {
    this.providerService.getServiceDetails(serviceId).subscribe({
      next: (service) => {
        if (service) {
          // 🧩 Reuse same image URL logic from FindServiceComponent
          service.imageUrl = service.imageUrl
            ? service.imageUrl.startsWith('http')
              ? service.imageUrl
              : service.imageUrl.startsWith('/uploads')
                ? `${this.uploadsUrl.replace(/\/+$/, '')}/${service.imageUrl.replace(/^\/uploads\/?/, '')}`
                : `${this.uploadsUrl.replace(/\/+$/, '')}/${service.imageUrl.replace(/^\/+/, '')}`
            : null;

          service.hiddenImage = false;
        }

        this.provider = service;
        this.isLoading = false;

        // Load reviews only if businessId is present
        if (service?.businessId) {
          this.loadReviews(service.businessId);
        }
      },
      error: (err) => {
        console.error('Failed to load service details:', err);
        this.isLoading = false;
      }
    });
  }

  private loadReviews(businessId: string): void {
    this.providerService.getBusinessReviews(businessId).subscribe({
      next: (reviews) => (this.reviews = reviews),
      error: (err) => console.error('Failed to load reviews:', err)
    });
  }

  // Hide broken images
  hideImage(provider: ServiceProvider) {
    provider.hiddenImage = true;
  }

  // Return visible image URL or null
  getServiceImage(provider: ServiceProvider): string | null {
    if (!provider.imageUrl || provider.hiddenImage) return null;
    return provider.imageUrl;
  }

  openBookingDialog(serviceId: string): void {
    console.log('Open booking dialog for service ID:', serviceId);
  }
}
