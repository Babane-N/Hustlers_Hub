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

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private router: Router
  ) {
    this.businessForm = this.fb.group({
      businessName: ['', Validators.required],
      category: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.businessForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = this.businessForm.value;

    this.businessService.registerBusiness(formData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.errorMessage = 'Something went wrong while registering the business.';
        this.isSubmitting = false;
      }
    });
  }
}
