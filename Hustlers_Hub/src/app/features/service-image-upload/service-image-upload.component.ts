import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceProvider, ServiceDetail } from '../service-detail/service.detail';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-image-upload',
  templateUrl: './service-image-upload.component.html',
  styleUrls: ['./service-image-upload.component.scss']
})
export class ServiceImageUploadComponent implements OnInit {

  services: ServiceDetail[] = [];
  selectedServiceId: string | null = null;

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploading = false;
  loadingServices = true;

  businessId!: string;

  constructor(
    private serviceProvider: ServiceProvider,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.businessId = this.getBusinessId();
    this.loadServices();
  }

  private loadServices(): void {
    this.serviceProvider
      .getServicesByBusiness(this.businessId)
      .subscribe({
        next: services => {
          this.services = services;
          this.loadingServices = false;
        },
        error: err => {
          console.error('Failed to load services', err);
          this.loadingServices = false;
        }
      });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFiles = Array.from(input.files);
    this.previewUrls = this.selectedFiles.map(file =>
      URL.createObjectURL(file)
    );
  }

  uploadImages(): void {
    if (!this.selectedServiceId || this.selectedFiles.length === 0) return;

    const formData = new FormData();
    this.selectedFiles.forEach(file =>
      formData.append('files', file)
    );

    this.uploading = true;

    this.http.post(
      `${environment.apiUrl}/Services/upload-images/${this.selectedServiceId}`,
      formData
    ).subscribe({
      next: () => {
        alert('Images uploaded successfully');
        this.reset();
      },
      error: err => {
        console.error('Upload failed', err);
        this.uploading = false;
      }
    });
  }

  private reset(): void {
    this.uploading = false;
    this.selectedFiles = [];
    this.previewUrls = [];
  }

  private getBusinessId(): string {
    // BEST PRACTICE: decode from JWT
    return localStorage.getItem('businessId')!;
  }
}

