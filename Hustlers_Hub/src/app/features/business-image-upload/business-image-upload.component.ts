import { Component, OnInit } from '@angular/core';
import { BusinessService } from '../business-switcher/BusinessModel';
import { AuthService } from '../auth/auth.service';
import {
  HttpClient,
  HttpEventType
} from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-business-image-upload',
  templateUrl: './business-image-upload.component.html',
  styleUrls: ['./business-image-upload.component.scss']
})
export class BusinessImageUploadComponent implements OnInit {

  businesses: any[] = [];

  selectedBusinessId: string | null = null;
  selectedBusiness: any = null;

  loadingBusinesses = false;

  // =====================================================
  // FILE UPLOAD
  // =====================================================
  selectedFiles: File[] = [];

  previewUrls: string[] = [];

  uploading = false;

  // =====================================================
  // IMAGE LIMIT
  // =====================================================
  readonly maxImages = 8;

  remainingSlots = 8;

  constructor(
    private businessService: BusinessService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    const user = this.authService.getUser();

    if (!user) return;

    this.loadingBusinesses = true;

    this.businessService
      .getUserBusinesses(user.id)
      .subscribe({
        next: (res) => {

          this.businesses = res;

          this.loadingBusinesses = false;
        },

        error: () => {
          this.loadingBusinesses = false;
        }
      });
  }

  // =====================================================
  // BUSINESS SELECTED
  // =====================================================
  onBusinessChange() {

    if (!this.selectedBusinessId) {
      this.selectedBusiness = null;
      return;
    }

    this.selectedBusiness = this.businesses.find(
      business => business.id === this.selectedBusinessId
    );

    // Current uploaded images count
    const currentImages =
      this.selectedBusiness?.images?.length || 0;

    this.remainingSlots =
      this.maxImages - currentImages;

    // Safety
    if (this.remainingSlots < 0) {
      this.remainingSlots = 0;
    }
  }

  // =====================================================
  // FILE SELECTION + PREVIEW
  // =====================================================
  onFileSelect(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    const files = Array.from(input.files);

    // =====================================================
    // CHECK IMAGE LIMIT
    // =====================================================
    if (files.length > this.remainingSlots) {

      alert(
        `You can only upload ${this.remainingSlots} more image(s).`
      );

      return;
    }

    this.selectedFiles = files;

    this.previewUrls = [];

    this.selectedFiles.forEach(file => {

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
      };

      reader.readAsDataURL(file);
    });
  }

  // =====================================================
  // REMOVE SELECTED IMAGE BEFORE UPLOAD
  // =====================================================
  removeSelectedImage(index: number) {

    this.selectedFiles.splice(index, 1);

    this.previewUrls.splice(index, 1);
  }

  // =====================================================
  // UPLOAD IMAGES
  // =====================================================
  uploadImages() {

    if (
      !this.selectedBusinessId ||
      this.selectedFiles.length === 0
    ) {
      return;
    }

    const formData = new FormData();

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    this.uploading = true;

    this.http.post(
      `${environment.apiUrl}/Businesses/${this.selectedBusinessId}/Images`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    )
      .subscribe({

        next: event => {

          if (event.type === HttpEventType.Response) {

            alert('Images uploaded successfully!');

            // Reset upload state
            this.selectedFiles = [];

            this.previewUrls = [];

            this.uploading = false;

            // Refresh businesses
            this.refreshBusinesses();
          }
        },

        error: err => {

          console.error('Upload failed', err);

          const message =
            err?.error?.message ||
            'Failed to upload images.';

          alert(message);

          this.uploading = false;
        }
      });
  }

  // =====================================================
  // DELETE IMAGE
  // =====================================================
  deleteImage(imageId: string) {

    if (!confirm('Delete this image?')) {
      return;
    }

    this.http.delete(
      `${environment.apiUrl}/Businesses/images/${imageId}`
    )
      .subscribe({

        next: () => {

          alert('Image deleted successfully.');

          this.refreshBusinesses();
        },

        error: err => {

          console.error(err);

          alert('Failed to delete image.');
        }
      });
  }

  // =====================================================
  // REFRESH BUSINESSES
  // =====================================================
  refreshBusinesses() {

    const user = this.authService.getUser();

    if (!user) return;

    this.businessService
      .getUserBusinesses(user.id)
      .subscribe({

        next: (res) => {

          this.businesses = res;

          this.onBusinessChange();
        }
      });
  }

  // =====================================================
  // GET FULL IMAGE URL
  // =====================================================
  getImageUrl(path?: string | null): string {

    if (!path) {
      return '';
    }

    // Already absolute URL
    if (path.startsWith('http')) {
      return path;
    }

    return `${environment.uploadsUrl.replace(/\/+$/, '')}/${path.replace(/^\/+|uploads\/?/g, '')}`;
  }
}
