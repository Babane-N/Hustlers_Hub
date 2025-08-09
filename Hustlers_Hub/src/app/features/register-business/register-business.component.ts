import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessService } from './business.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-business',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss']
})
export class RegisterBusinessComponent {
  businessForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  logoPreview: string | null = null;
  selectedLogoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private router: Router
  ) {
    this.businessForm = this.fb.group({
      businessName: ['', Validators.required],
      category: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

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

  onSubmit(): void {
    if (this.businessForm.invalid || !this.getUserId()) {
      this.errorMessage = 'Please complete the form and ensure you are logged in.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('businessName', this.businessForm.value.businessName);
    formData.append('category', this.businessForm.value.category);
    formData.append('location', this.businessForm.value.location);
    formData.append('description', this.businessForm.value.description);
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

  private getUserId(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.userId : '';
  }
}
