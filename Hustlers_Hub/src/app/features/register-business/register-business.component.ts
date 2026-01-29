import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessService } from './business.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-business',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss']
})
export class RegisterBusinessComponent implements OnInit, AfterViewInit {

  // -------------------------------
  // View / UI State
  // -------------------------------
  showAdminFeeModal = false;
  showVerificationInfoModal = false;
  showApprovalNotice = false;

  isSubmitting = false;
  errorMessage = '';

  // -------------------------------
  // Form & Upload
  // -------------------------------
  businessForm: FormGroup;
  logoPreview: string | null = null;
  selectedLogoFile: File | null = null;

  isVerified = false;

  // -------------------------------
  // Google Maps
  // -------------------------------
  @ViewChild('addressInput') addressInput!: ElementRef<HTMLInputElement>;

  center: google.maps.LatLngLiteral = { lat: -26.2041, lng: 28.0473 };
  selectedPosition: google.maps.LatLngLiteral | null = null;
  zoom = 14;

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private router: Router
  ) {
    this.businessForm = this.fb.group({
      businessType: ['', Validators.required], // verified | unverified
      registrationNumber: [''],

      businessName: ['', Validators.required],
      category: ['', Validators.required],
      location: [''],
      description: ['', Validators.required],

      latitude: [null],
      longitude: [null]
    });
  }

  // -------------------------------
  // Init
  // -------------------------------
  ngOnInit(): void {
    const seen = localStorage.getItem('seenBusinessAdminFeeInfo');
    if (!seen) {
      this.showAdminFeeModal = true;
    }
  }

  ngAfterViewInit(): void {
    const autocomplete = new google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      { fields: ['geometry', 'formatted_address'] }
    );

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
  // Admin Fee Modal Controls
  // -------------------------------
  closeAdminFeeModal(): void {
    localStorage.setItem('seenBusinessAdminFeeInfo', 'true');
    this.showAdminFeeModal = false;
  }

  openVerificationInfo(): void {
    this.showVerificationInfoModal = true;
  }

  closeVerificationInfo(): void {
    this.showVerificationInfoModal = false;
  }

  // -------------------------------
  // Verified Business Toggle
  // -------------------------------
  onBusinessTypeChange(): void {
    const type = this.businessForm.get('businessType')?.value;

    if (type === 'verified') {
      this.isVerified = true;
      this.businessForm
        .get('registrationNumber')
        ?.setValidators([Validators.required]);
    } else {
      this.isVerified = false;
      this.businessForm.get('registrationNumber')?.clearValidators();
      this.businessForm.get('registrationNumber')?.setValue('');
    }

    this.businessForm.get('registrationNumber')?.updateValueAndValidity();
  }

  // -------------------------------
  // Logo Upload
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
  // Map Click
  // -------------------------------
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      this.selectedPosition = event.latLng.toJSON();

      this.businessForm.patchValue({
        latitude: this.selectedPosition.lat,
        longitude: this.selectedPosition.lng
      });
    }
  }

  // -------------------------------
  // Submit Form
  // -------------------------------
  onSubmit(): void {
    if (this.businessForm.invalid || !this.getUserId()) {
      this.errorMessage = 'Please complete the form and ensure you are logged in.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.showApprovalNotice = true;

    const formData = new FormData();
    const value = this.businessForm.value;

    formData.append('businessType', value.businessType);
    formData.append('registrationNumber', value.registrationNumber || '');
    formData.append('businessName', value.businessName);
    formData.append('category', value.category);
    formData.append('location', value.location || '');
    formData.append('description', value.description);
    formData.append('latitude', value.latitude ?? '');
    formData.append('longitude', value.longitude ?? '');
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
  // User ID
  // -------------------------------
  private getUserId(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.userId : '';
  }
}
