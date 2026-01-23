import { Component, OnInit } from '@angular/core';
import { BusinessService } from '../business-switcher/BusinessModel';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-business-image-upload',
  templateUrl: './business-image-upload.component.html',
  styleUrls: ['./business-image-upload.component.scss']
})
export class BusinessImageUploadComponent implements OnInit {

  businesses: any[] = [];
  selectedBusinessId: string | null = null;
  loadingBusinesses = false;

  // File upload
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploading = false;

  constructor(
    private businessService: BusinessService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) return;

    this.loadingBusinesses = true;

    this.businessService.getUserBusinesses(user.id).subscribe({
      next: (res) => {
        this.businesses = res;
        this.loadingBusinesses = false;
      },
      error: () => this.loadingBusinesses = false
    });
  }

  // ======================
  // File selection & preview
  // ======================
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.selectedFiles = Array.from(input.files);
    this.previewUrls = [];

    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  // ======================
  // Upload images
  // ======================
  uploadImages() {
    if (!this.selectedBusinessId || this.selectedFiles.length === 0) return;

    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('images', file));

    this.uploading = true;

    this.http.post(`${environment.apiUrl}/Businesses/${this.selectedBusinessId}/Images`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: event => {
        if (event.type === HttpEventType.Response) {
          alert('Images uploaded successfully!');
          this.selectedFiles = [];
          this.previewUrls = [];
          this.uploading = false;
        }
      },
      error: err => {
        console.error('Upload failed', err);
        alert('Failed to upload images.');
        this.uploading = false;
      }
    });
  }

}
