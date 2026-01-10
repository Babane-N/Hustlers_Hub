import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-image-upload',
  templateUrl: './service-image-upload.component.html',
  styleUrls: ['./service-image-upload.component.scss']
})
export class ServiceImageUploadComponent {

  @Input() serviceId!: string; // service.id will be passed here

  selectedFiles: File[] = [];
  uploading = false;
  previewUrls: string[] = [];

  constructor(private http: HttpClient) { }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFiles = Array.from(input.files);
    this.previewUrls = this.selectedFiles.map(file =>
      URL.createObjectURL(file)
    );
  }

  uploadImages(): void {
    if (!this.serviceId || this.selectedFiles.length === 0) {
      console.warn('Missing serviceId or no files selected');
      return;
    }

    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('files', file));

    this.uploading = true;

    this.http.post(`${environment.apiUrl}/Services/upload-images/${this.serviceId}`, formData)
      .subscribe({
        next: () => {
          alert('Images uploaded successfully');

          // reset state
          this.uploading = false;
          this.selectedFiles = [];
          this.previewUrls = [];
        },
        error: err => {
          console.error('Upload failed', err);
          this.uploading = false;
        }
      });
  }
}
