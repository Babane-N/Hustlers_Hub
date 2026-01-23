import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { AuthService } from '../auth.service';
import { ActiveServiceContextService } from '../../../core/active-service-context.service';

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
    private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private activeServiceContext: ActiveServiceContextService
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
    const userPayload = { fullName, email, password, phoneNumber, userType: 0 }; // Customer

    this.http.post(`${environment.apiUrl}/auth/register`, userPayload).subscribe({
      next: (res: any) => {
        // Use AuthService to store token + role
        this.authService.setSession(res.token, res.role);
        this.authService.setUser(res.user);

        // Clear any previous active service
        this.activeServiceContext.clear();

        // Navigate based on role
        switch (res.role.toLowerCase()) {
          case 'business':
            this.router.navigate(['/switch-service']);
            break;
          case 'customer':
            this.router.navigate(['/home-page']);
            break;
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          default:
            this.router.navigate(['/home-page']);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.registrationError = err?.error?.message || 'Registration failed.';
        this.isLoading = false;
      }
    });
  }

  // Google login
  onGoogleSignIn(): void {
    this.socialAuthService.signIn('GOOGLE').then((user: SocialUser) => {
      this.http.post(`${environment.apiUrl}/auth/google`, { token: user.idToken }).subscribe({
        next: (res: any) => this.handleSocialLogin(res),
        error: (err) => this.handleSocialError(err, 'Google')
      });
    }).catch(err => this.handleSocialError(err, 'Google'));
  }

  // Facebook login
  onFacebookSignIn(): void {
    this.socialAuthService.signIn('FACEBOOK').then((user: SocialUser) => {
      this.http.post(`${environment.apiUrl}/auth/facebook`, { token: user.authToken }).subscribe({
        next: (res: any) => this.handleSocialLogin(res),
        error: (err) => this.handleSocialError(err, 'Facebook')
      });
    }).catch(err => this.handleSocialError(err, 'Facebook'));
  }

  // Handle social login response
  private handleSocialLogin(res: any) {
    this.authService.setSession(res.token, res.role);
    this.authService.setUser(res.user);
    this.activeServiceContext.clear();

    switch (res.role.toLowerCase()) {
      case 'business':
        this.router.navigate(['/switch-service']);
        break;
      case 'customer':
        this.router.navigate(['/home-page']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/home-page']);
    }
  }

  // Unified social login error handler
  public handleSocialError(err: any, provider: string) {
    console.error(`${provider} login error:`, err);
    this.registrationError = err?.error?.message || `${provider} registration failed`;
  }
}
