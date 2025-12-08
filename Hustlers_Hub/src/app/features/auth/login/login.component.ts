import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';   // Your backend service
import { SocialAuthService, GoogleLoginProvider, FacebookLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  loginError = '';

  // Rename social login service to avoid conflicts
  constructor(
    private socialAuth: SocialAuthService,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private backendAuth: AuthService   // Your API login service
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // ----------------------------
  // 🔐 NORMAL EMAIL/PASSWORD LOGIN
  // ----------------------------
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginError = '';

    const credentials = this.loginForm.value;

    this.backendAuth.login(credentials).subscribe({
      next: (res) => {

        this.backendAuth.setSession(res.token, res.role);

        localStorage.setItem('user', JSON.stringify({
          userId: res.userId,
          email: res.email,
          role: res.role,
          token: res.token
        }));

        switch (res.role) {
          case 'Business': this.router.navigate(['/home']); break;
          case 'Customer': this.router.navigate(['/home-page']); break;
          case 'Admin': this.router.navigate(['/admin']); break;
          default: this.router.navigate(['/home-page']);
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // ----------------------------
  // 🔵 GOOGLE LOGIN
  // ----------------------------
  onGoogleSignIn(user: any) {
    const socialUser = user as SocialUser;

    this.http.post(`${environment.apiUrl}/auth/google`, { token: socialUser.idToken })
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/home-page']);
        },
        error: (err) => {
          console.error(err);
          this.loginError = err?.error?.message || 'Google login failed';
        }
      });
  }


  // ----------------------------
  // 🔵 FACEBOOK LOGIN
  // ----------------------------
  onFacebookSignIn() {
    this.socialAuth.signIn(FacebookLoginProvider.PROVIDER_ID)
      .then(user => {
        return this.http.post(
          `${environment.apiUrl}/auth/facebook`,
          { token: user.authToken }
        ).toPromise();
      })
      .then((res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/home-page']);
      })
      .catch(err => {
        console.error(err);
        this.loginError = err?.error?.message || 'Facebook login failed.';
      });
  }

  handleSocialError(err: any, provider: string) {
    console.error(`${provider} login error:`, err);
    this.loginError = err?.error?.message || `${provider} login failed`;
  }

}
