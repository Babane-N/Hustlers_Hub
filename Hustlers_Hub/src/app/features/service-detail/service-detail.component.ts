import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import {
  ServiceProvider,
  BusinessDetail,
  Review
} from './service.detail';

import {
  BookingDialogComponent
} from '../booking-dialog/booking-dialog.component';

import {
  environment
} from '../../../environments/environment';

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

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      console.error('Missing service ID');

      this.isLoading = false;

      return;
    }

    this.businessId = id;

    this.loadService(id);
  }

  // =====================================================
  // LOAD BUSINESS
  // =====================================================
  private loadService(
    businessId: string
  ): void {

    this.serviceProvider
      .getServiceDetails(businessId)
      .subscribe({

        next: service => {

          // =========================================
          // Ensure businessId exists
          // =========================================
          service.businessId =
            service.businessId || service.id;

          // =========================================
          // Normalize logo
          // =========================================
          service.logoUrl =
            this.normalizeUrl(
              service.logoUrl
            );

          // =========================================
          // Normalize gallery images
          // =========================================
          service.images =
            this.normalizeImages(
              service.images as any[]
            );

          // =========================================
          // Assign business
          // =========================================
          this.business = service;

          // =========================================
          // Stop loading
          // =========================================
          this.isLoading = false;

          // =========================================
          // Load reviews safely
          // =========================================
          this.loadReviews(
            service.businessId
          );
        },

        error: err => {

          console.error(
            'Failed to load Business',
            err
          );

          this.isLoading = false;
        }
      });
  }

  // =====================================================
  // LOAD REVIEWS
  // =====================================================
  private loadReviews(
    businessId: string
  ): void {

    if (!businessId) {
      return;
    }

    this.serviceProvider
      .getBusinessReviews(businessId)
      .subscribe({

        next: reviews => {

          this.reviews = reviews;
        },

        error: err => {

          console.error(
            'Failed to load reviews',
            err
          );
        }
      });
  }

  // =====================================================
  // HIDE BROKEN IMAGE
  // =====================================================
  hideImage(
    imgUrl: string
  ): void {

    if (
      this.business &&
      this.business.images
    ) {

      this.business.images =
        this.business.images.filter(
          i => i !== imgUrl
        );
    }
  }

  // =====================================================
  // OPEN BOOKING DIALOG
  // =====================================================
  openBookingDialog(): void {

    if (!this.business?.id) {
      return;
    }

    this.dialog.open(
      BookingDialogComponent,
      {
        width: '480px',

        data: {
          businessId: this.business.id
        }
      }
    );
  }

  // =====================================================
  // NORMALIZE URL
  // =====================================================
  public normalizeUrl(
    url?: string | null
  ): string | null {

    if (!url) {
      return null;
    }

    // Already full URL
    if (url.startsWith('http')) {
      return url;
    }

    return `${this.uploadsUrl.replace(/\/+$/, '')}/${url.replace(/^\/+|uploads\/?/g, '')}`;
  }

  // =====================================================
  // NORMALIZE IMAGES
  // Supports:
  // 1. string[]
  // 2. { id, imageUrl }[]
  // =====================================================
  private normalizeImages(
    images?: any[]
  ): string[] {

    if (
      !images ||
      !Array.isArray(images) ||
      !images.length
    ) {
      return [];
    }

    return images
      .map(image => {

        const imageUrl =
          typeof image === 'string'
            ? image
            : image?.imageUrl;

        return this.normalizeUrl(imageUrl);
      })
      .filter(
        (img): img is string =>
          typeof img === 'string'
      );
  }
}
