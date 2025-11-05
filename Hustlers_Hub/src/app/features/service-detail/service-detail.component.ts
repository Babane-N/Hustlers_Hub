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
  provider!: ServiceDetail;   // non-null after load
  reviews: Review[] = [];
  uploadsUrl = environment.uploadsUrl; // point to correct folder

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceProvider: ServiceProvider
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.serviceProvider.getServiceWithReviews(id).subscribe({
        next: ({ provider, reviews }) => {
          this.provider = provider;
          this.reviews = reviews;
        },
        error: err => console.error('Error loading service details:', err)
      });
    }
  }

  openBookingDialog(providerId: string) {
    this.router.navigate(['/book', providerId]);
  }
}
