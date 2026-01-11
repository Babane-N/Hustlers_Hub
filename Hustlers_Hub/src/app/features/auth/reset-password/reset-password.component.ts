import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  isSubmitting: boolean = false;

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Read token & email from query params
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  submit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.message = 'Please enter your new password.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    if (!this.token || !this.email) {
      this.message = 'Invalid or expired reset link.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    this.http.post(
      `${this.apiUrl}/auth/reset-password`,
      {
        email: this.email,
        token: this.token,
        newPassword: this.newPassword
      }
    ).subscribe({
      next: () => {
        this.message = 'Password reset successful! Redirecting to login...';
        this.isSubmitting = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error(err);
        this.message = 'Failed to reset password. The link may have expired.';
        this.isSubmitting = false;
      }
    });
  }
}
