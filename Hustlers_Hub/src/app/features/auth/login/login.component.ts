import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { SocialAuthService, GoogleLoginProvider, FacebookLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ActiveServiceContextService } from '../../../core/active-service-context.service';

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
    private http: HttpClient,
    private authService: AuthService,
    private socialAuth: SocialAuthService,
    private activeServiceContext: ActiveServiceContextService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // -------------------------------------------------
  // EMAIL / PASSWORD LOGIN
  // -------------------------------------------------
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginError = '';

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        // Save token + role
        this.authService.setSession(res.token, res.role);
        this.authService.setUser(res.user);

        // Clear previous active service
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
        this.loginError = err?.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // -------------------------------------------------
  // GOOGLE LOGIN
  // -------------------------------------------------
  onGoogleSignIn(): void {
    this.socialAuth.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((socialUser: SocialUser) => {
        this.http.post(`${environment.apiUrl}/auth/google`, { token: socialUser.idToken })
          .subscribe({
            next: (res: any) => this.handleSocialLogin(res),
            error: (err) => this.handleSocialError(err, 'Google')
          });
      })
      .catch(err => this.handleSocialError(err, 'Google'));
  }

  // -------------------------------------------------
  // FACEBOOK LOGIN
  // -------------------------------------------------
  onFacebookSignIn(): void {
    this.socialAuth.signIn(FacebookLoginProvider.PROVIDER_ID)
      .then((socialUser: SocialUser) => {
        this.http.post(`${environment.apiUrl}/auth/facebook`, { token: socialUser.authToken })
          .subscribe({
            next: (res: any) => this.handleSocialLogin(res),
            error: (err) => this.handleSocialError(err, 'Facebook')
          });
      })
      .catch(err => this.handleSocialError(err, 'Facebook'));
  }

  // -------------------------------------------------
  // HANDLE SOCIAL LOGIN RESPONSE
  // -------------------------------------------------
  private handleSocialLogin(res: any) {
    this.authService.setSession(res.token, res.role);
    this.authService.setUser(res.user);
    this.activeServiceContext.clear();

    switch (res.role.toLowerCase()) {
      case 'business':
        this.router.navigate(['/home']);
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

  // -------------------------------------------------
  // HANDLE SOCIAL ERRORS
  // -------------------------------------------------
  public handleSocialError(err: any, provider: string) {
    console.error(`${provider} login error:`, err);
    this.loginError = err?.error?.message || `${provider} login failed.`;
  }

  // -------------------------------------------------
  // NAVIGATE TO FORGOT PASSWORD
  // -------------------------------------------------
  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
