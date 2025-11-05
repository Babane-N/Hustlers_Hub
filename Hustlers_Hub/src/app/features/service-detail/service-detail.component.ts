import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceProvider, ServiceDetail, Review } from './service.detail';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  service!: ServiceDetail;
  reviews: Review[] = [];
  uploadsUrl = environment.uploadsUrl;

  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceProvider: ServiceProvider
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Invalid service ID.';
      this.isLoading = false;
      return;
    }

    // ✅ Fetch service details
    this.serviceProvider.getServiceDetails(id).subscribe({
      next: (data) => {
        this.service = data;
        this.isLoading = false;

        // ✅ Load reviews for the business
        if (data.businessName) {
          this.serviceProvider.getBusinessReviews(data.id).subscribe({
            next: (reviews) => (this.reviews = reviews),
            error: (err) => console.error('Failed to load reviews:', err)
          });
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load service details.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // ✅ Navigate to booking page
  openBookingDialog(providerId: string): void {
    this.router.navigate(['/book', providerId]);
  }
}
