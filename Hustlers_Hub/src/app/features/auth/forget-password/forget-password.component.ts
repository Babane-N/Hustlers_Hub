import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {
  email: string = '';
  message: string = '';
  isSubmitting: boolean = false;

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  submit() {
    if (!this.email) {
      this.message = 'Please enter your email.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    this.http.post(
      `${this.apiUrl}/auth/forgot-password`,
      { email: this.email }
    ).subscribe({
      next: () => {
        this.message = 'If the email exists, a reset link was sent.';
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.message = 'Something went wrong. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
