import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  registrationError = '';
  private baseUrl = `${environment.apiUrl}/auth/register`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private socialAuthService: SocialAuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.matchPasswords });
  }

  matchPasswords(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.registrationError = '';

    const { fullName, email, phoneNumber, password } = this.registerForm.value;
    const userPayload = {
      fullName,
      email,
      password,
      phoneNumber,
      userType: 0 // Customer
    };

    this.http.post(`${environment.apiUrl}/auth/register`, userPayload).subscribe({
      next: () => {
        this.router.navigate(['/home-page']);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.registrationError = err?.error || 'Registration failed.';
        this.isLoading = false;
      }
    });
  }


  // Google login
  onGoogleSignIn(event: any) {
    const user = event as SocialUser | undefined;
    if (!user) {
      console.error('Google sign-in failed: user is undefined');
      this.registrationError = 'Google sign-in failed';
      return;
    }

    this.http.post(`${environment.apiUrl}/auth/google`, { token: user.idToken }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/home-page']);
      },
      error: (err) => {
        console.error(err);
        this.registrationError = err?.error?.message || 'Google registration failed';
      }
    });
  }

  // Facebook login
  onFacebookSignIn(event: any) {
    const user = event as SocialUser | undefined;
    if (!user) {
      console.error('Facebook sign-in failed: user is undefined');
      this.registrationError = 'Facebook sign-in failed';
      return;
    }

    this.http.post(`${environment.apiUrl}/auth/facebook`, { token: user.authToken }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/home-page']);
      },
      error: (err) => {
        console.error(err);
        this.registrationError = err?.error?.message || 'Facebook registration failed';
      }
    });
  }

  // Unified social login error handler
  handleSocialError(err: any, provider: string) {
    console.error(`${provider} login error:`, err);
    this.registrationError = err?.error?.message || `${provider} registration failed`;
  }
}
