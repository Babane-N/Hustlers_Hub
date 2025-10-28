import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  registrationError = '';
  private baseUrl = `${environment.apiUrl}/Users`;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
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
    const userPayload = { fullName, email, password, phoneNumber, userType: 0, createdAt: new Date().toISOString() };

    this.http.post(this.baseUrl, userPayload).subscribe({
      next: () => { this.router.navigate(['/home-page']); this.isLoading = false; },
      error: (err) => { console.error(err); this.registrationError = err.error || 'Registration failed.'; this.isLoading = false; }
    });
  }
}
