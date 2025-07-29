import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  loginError = '';

  private loginUrl = 'https://localhost:7018/api/Users/login'; // 🔁 Update if your endpoint differs

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
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

    this.http.post<any>(this.loginUrl, loginData).subscribe({
      next: (response) => {
        // ✅ Save to localStorage
        localStorage.setItem('user', JSON.stringify({
          token: response.token,
          role: response.role,
          userId: response.userId,
          email: response.email
        }));

        // ✅ Navigate to a role-based route
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

