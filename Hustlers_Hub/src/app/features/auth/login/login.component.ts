import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  loginError = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginError = '';

    const { email, password } = this.loginForm.value;

    // Simulate backend call
    setTimeout(() => {
      // 🔒 Replace this logic with actual API call to AuthService
      if (email === 'test@example.com' && password === '123456') {
        const fakeResponse = {
          token: 'fake-jwt-token-123',
          role: 'business',
          userId: 'abc123',
          email: email
        };

        // ✅ Save to localStorage
        localStorage.setItem('user', JSON.stringify(fakeResponse));

        // ✅ Navigate to a role-based route
        if (fakeResponse.role === 'business') {
          this.router.navigate(['/dashboard']);
        } else if (fakeResponse.role === 'customer') {
          this.router.navigate(['/home-page']);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        this.loginError = 'Invalid credentials. Please try again.';
      }

      this.isLoading = false;
    }, 1000);
  }
}
