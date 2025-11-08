import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceProvider, ServiceDetail, Review } from './service.detail';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  environment = environment;
  provider: ServiceDetail | null = null;
  reviews: Review[] = [];
  isLoading = true;

  uploadsUrl = environment.uploadsUrl;

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceProvider
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadServiceFromAll(id);
    } else {
      console.error('❌ Service ID is missing in route.');
      this.isLoading = false;
    }
  }

  /**
   * ✅ Loads all services from the table and finds the one matching the ID
   * This matches how FindServiceComponent retrieves data.
   */
  private loadServiceFromAll(serviceId: string): void {
    this.serviceService.getAllProviders().subscribe({
      next: (services) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          // ✅ Fix both image and logo URLs
          service.logoUrl = this.resolveImageUrl(service.imageUrl);
          service.logoUrl = this.resolveImageUrl(service.logoUrl);

          this.provider = service;
          if (service.businessId) {
            this.loadReviews(service.businessId);
          } else {
            this.isLoading = false;
          }
        } else {
          console.warn(`⚠️ Service with ID ${serviceId} not found.`);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('❌ Failed to load service list:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * ✅ Loads reviews for this provider's business
   */
  private loadReviews(businessId: string): void {
    this.serviceService.getBusinessReviews(businessId).subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load reviews:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * ✅ Prevents double `/uploads` or missing domain
   */
  private resolveImageUrl(imagePath?: string | null): string | null {
    if (!imagePath) return null;

    // Absolute URL already valid
    if (imagePath.startsWith('http')) return imagePath;

    // Starts with /uploads → prepend uploadsUrl only once
    if (imagePath.startsWith('/uploads')) {
      return `${this.uploadsUrl.replace(/\/+$/, '')}${imagePath}`;
    }

    // Filename only → prepend /uploads/
    return `${this.uploadsUrl.replace(/\/+$/, '')}/uploads/${imagePath.replace(/^\/+/, '')}`;
  }

  /**
   * ✅ Gracefully hides broken images
   */
  hideImage(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }

  openBookingDialog(serviceId: string): void {
    console.log('🗓️ Open booking dialog for service ID:', serviceId);
    // TODO: integrate booking modal
  }
}
