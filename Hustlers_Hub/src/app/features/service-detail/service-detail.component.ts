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
  environment = environment; // expose it to the template

  provider: ServiceDetail | null = null;    // Holds the service provider details
  reviews: Review[] = [];                   // Holds reviews for the provider
  uploadsUrl = 'https://api.example.com/uploads'; // Replace with your actual uploads URL
  isLoading = true;                         // Optional: show loading state

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
        this.provider = service;

        // Only fetch reviews if businessId exists
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

  openBookingDialog(serviceId: string): void {
    // TODO: implement booking dialog logic
    console.log('Open booking dialog for service ID:', serviceId);
  }
}
