import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // Adjust path if needed

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginError = '';

    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        // Save token and role in localStorage using AuthService or here explicitly
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('userEmail', response.email);

        // Navigate based on role
        switch (response.role) {
          case 'Business':
            this.router.navigate(['/home']);
            break;
          case 'Customer':
            this.router.navigate(['/home-page']);
            break;
          case 'Admin':
            this.router.navigate(['/admin/users']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
