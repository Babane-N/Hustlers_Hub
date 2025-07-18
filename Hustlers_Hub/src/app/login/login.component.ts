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

    // Simulate API call
    setTimeout(() => {
      const { email, password } = this.loginForm.value;

      if (email === 'test@example.com' && password === '123456') {
        this.router.navigate(['/home-home']); // or /dashboard
      } else {
        this.loginError = 'Invalid credentials. Please try again.';
      }

      this.isLoading = false;
    }, 1000);
  }
}
