import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessService } from './business.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-business',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss']
})
export class RegisterBusinessComponent implements AfterViewInit {

  @ViewChild('addressInput') addressInput!: ElementRef<HTMLInputElement>;

  businessForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  logoPreview: string | null = null;
  selectedLogoFile: File | null = null;

  isVerified = false; // Toggles CIPC field

  center: google.maps.LatLngLiteral = { lat: -26.2041, lng: 28.0473 };
  selectedPosition: google.maps.LatLngLiteral | null = null;
  zoom = 14;

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private router: Router
  ) {
    this.businessForm = this.fb.group({
      businessType: ['', Validators.required], // verified or unverified
      registrationNumber: [''],               // only required when verified

      businessName: ['', Validators.required],
      category: ['', Validators.required],
      location: [''],
      description: ['', Validators.required],
      latitude: [null],
      longitude: [null],
    });
  }

  ngAfterViewInit(): void {
    const autocomplete = new google.maps.places.Autocomplete(this.addressInput.nativeElement, {
      fields: ['geometry', 'formatted_address']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        this.center = { lat, lng };
        this.selectedPosition = { lat, lng };

        this.businessForm.patchValue({
          location: place.formatted_address,
          latitude: lat,
          longitude: lng
        });
      }
    });
  }

  // -------------------------------
  // Verified Business Toggle Logic
  // -------------------------------
  onBusinessTypeChange() {
    const type = this.businessForm.get('businessType')?.value;

    if (type === 'verified') {
      this.isVerified = true;
      this.businessForm.get('registrationNumber')?.setValidators([Validators.required]);
    } else {
      this.isVerified = false;
      this.businessForm.get('registrationNumber')?.clearValidators();
    }

    this.businessForm.get('registrationNumber')?.updateValueAndValidity();
  }

  // -------------------------------
  // Logo upload logic
  // -------------------------------
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.selectedLogoFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedLogoFile);
    }
  }

  // -------------------------------
  // Map selection logic
  // -------------------------------
  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.selectedPosition = event.latLng.toJSON();
      this.businessForm.patchValue({
        latitude: this.selectedPosition.lat,
        longitude: this.selectedPosition.lng
      });
    }
  }

  // -------------------------------
  // Submit form
  // -------------------------------
  onSubmit(): void {
    if (this.businessForm.invalid || !this.getUserId()) {
      this.errorMessage = 'Please complete the form and ensure you are logged in.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('businessType', this.businessForm.value.businessType);
    formData.append('registrationNumber', this.businessForm.value.registrationNumber || '');

    formData.append('businessName', this.businessForm.value.businessName);
    formData.append('category', this.businessForm.value.category);
    formData.append('location', this.businessForm.value.location || '');
    formData.append('description', this.businessForm.value.description);
    formData.append('latitude', this.businessForm.value.latitude ?? '');
    formData.append('longitude', this.businessForm.value.longitude ?? '');
    formData.append('userId', this.getUserId());

    if (this.selectedLogoFile) {
      formData.append('logo', this.selectedLogoFile);
    }

    this.businessService.registerBusiness(formData).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        this.errorMessage = 'Something went wrong while registering the business.';
        this.isSubmitting = false;
      }
    });
  }

  // -------------------------------
  // Get user id
  // -------------------------------
  private getUserId(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.userId : '';
  }
}
