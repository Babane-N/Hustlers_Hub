import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BusinessService } from './business.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register-business',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss']
})
export class RegisterBusinessComponent implements OnInit, AfterViewInit {

  // --------------------------------
  // UI State
  // --------------------------------
  showAdminFeeModal = false;
  showVerificationInfoModal = false;
  showApprovalNotice = false;

  isSubmitting = false;
  errorMessage = '';

  // --------------------------------
  // User/Auth
  // --------------------------------
  user: any = null;
  isLoggedIn = false;

  // --------------------------------
  // Form & Upload
  // --------------------------------
  businessForm: FormGroup;
  logoPreview: string | null = null;
  selectedLogoFile: File | null = null;

  isVerified = false;

  // --------------------------------
  // Google Maps
  // --------------------------------
  @ViewChild('addressInput')
  addressInput!: ElementRef<HTMLInputElement>;

  center: google.maps.LatLngLiteral = {
    lat: -26.2041,
    lng: 28.0473
  };

  selectedPosition: google.maps.LatLngLiteral | null = null;

  zoom = 14;

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private router: Router,
    private authService: AuthService
  ) {

    this.businessForm = this.fb.group({

      businessType: ['', Validators.required],

      registrationNumber: [''],

      businessName: ['', Validators.required],

      category: ['', Validators.required],

      location: [''],

      description: ['', Validators.required],

      latitude: [null],

      longitude: [null]
    });
  }

  // --------------------------------
  // Init
  // --------------------------------
  ngOnInit(): void {

    // Admin fee modal
    const seen = localStorage.getItem('seenBusinessAdminFeeInfo');

    if (!seen) {
      this.showAdminFeeModal = true;
    }

    // Auth subscription
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;

      console.log('Logged in user:', user);
    });
  }

  // --------------------------------
  // Google Places Autocomplete
  // --------------------------------
  ngAfterViewInit(): void {

    const autocomplete = new google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      {
        fields: ['geometry', 'formatted_address']
      }
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

  // --------------------------------
  // Modal Controls
  // --------------------------------
  closeAdminFeeModal(): void {

    localStorage.setItem(
      'seenBusinessAdminFeeInfo',
      'true'
    );

    this.showAdminFeeModal = false;
  }

  openVerificationInfo(): void {
    this.showVerificationInfoModal = true;
  }

  closeVerificationInfo(): void {
    this.showVerificationInfoModal = false;
  }

  // --------------------------------
  // Business Type
  // --------------------------------
  onBusinessTypeChange(): void {

    const type =
      this.businessForm.get('businessType')?.value;

    if (type === 'verified') {

      this.isVerified = true;

      this.businessForm
        .get('registrationNumber')
        ?.setValidators([Validators.required]);

    } else {

      this.isVerified = false;

      this.businessForm
        .get('registrationNumber')
        ?.clearValidators();

      this.businessForm
        .get('registrationNumber')
        ?.setValue('');
    }

    this.businessForm
      .get('registrationNumber')
      ?.updateValueAndValidity();
  }

  // --------------------------------
  // Logo Upload
  // --------------------------------
  onLogoSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (input.files && input.files[0]) {

      this.selectedLogoFile = input.files[0];

      const reader = new FileReader();

      reader.onload = () => {
        this.logoPreview =
          reader.result as string;
      };

      reader.readAsDataURL(
        this.selectedLogoFile
      );
    }
  }

  // --------------------------------
  // Map Click
  // --------------------------------
  onMapClick(
    event: google.maps.MapMouseEvent
  ): void {

    if (event.latLng) {

      this.selectedPosition =
        event.latLng.toJSON();

      this.businessForm.patchValue({
        latitude: this.selectedPosition.lat,
        longitude: this.selectedPosition.lng
      });
    }
  }

  // --------------------------------
  // Submit
  // --------------------------------
  onSubmit(): void {

    // Form validation
    if (this.businessForm.invalid) {

      this.errorMessage =
        'Please complete all required fields.';

      console.log(
        'Form Invalid:',
        this.businessForm.value
      );

      return;
    }

    // User validation
    if (!this.user) {

      this.errorMessage =
        'You must be logged in to register a business.';

      console.log('User not found');

      return;
    }

    this.isSubmitting = true;

    this.errorMessage = '';

    this.showApprovalNotice = true;

    const formData = new FormData();

    const value = this.businessForm.value;

    // Append form values
    formData.append(
      'businessType',
      value.businessType
    );

    formData.append(
      'registrationNumber',
      value.registrationNumber || ''
    );

    formData.append(
      'businessName',
      value.businessName
    );

    formData.append(
      'category',
      value.category
    );

    formData.append(
      'location',
      value.location || ''
    );

    formData.append(
      'description',
      value.description
    );

    formData.append(
      'latitude',
      value.latitude ?? ''
    );

    formData.append(
      'longitude',
      value.longitude ?? ''
    );

    // Append logged-in user ID
    formData.append(
      'userId',
      this.getUserId()
    );

    // Append logo if selected
    if (this.selectedLogoFile) {

      formData.append(
        'logo',
        this.selectedLogoFile
      );
    }

    console.log('Submitting business...');

    // API Call
    this.businessService
      .registerBusiness(formData)
      .subscribe({

        next: (response) => {

          console.log(
            'Business registered:',
            response
          );

          this.router.navigate(['/home']);
        },

        error: (error) => {

          console.error(
            'Registration Error:',
            error
          );

          this.errorMessage =
            'Something went wrong while registering the business.';

          this.isSubmitting = false;
        }
      });
  }

  // --------------------------------
  // Get User ID
  // --------------------------------
  private getUserId(): string {

    return (
      this.user?.userId ||
      this.user?.id ||
      ''
    );
  }
}
