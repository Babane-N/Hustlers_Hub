import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-edit-business',
  templateUrl: './edit-business.component.html',
  styleUrls: ['./edit-business.component.scss']
})
export class EditBusinessComponent implements OnInit {

  businessForm: FormGroup;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  logoPreview: string | null = null;
  businessId: string = '';
  user: any = null;
  selectedLogoFile: File | null = null;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {

    this.businessForm = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      description: [''],
      category: [''],
      phoneNumber: [''],
      address: ['']
    });
  }

  normalizeUrl(url?: string | null): string | null {

    if (!url) {
      return null;
    }

    // Already full URL
    if (url.startsWith('http')) {
      return url;
    }

    return `${environment.uploadsUrl.replace(/\/+$/, '')}/${url.replace(/^\/+|uploads\/?/g, '')}`;
  }

  ngOnInit(): void {

    this.authService.user$.subscribe(user => {

      this.user = user;

      if (!user) {
        this.errorMessage = 'User not logged in';
        this.isLoading = false;
        return;
      }

      const userId = user.id;

      console.log('Logged in User:', user);
      console.log('User ID:', userId);

      // Fetch business for logged-in user
      this.http.get<any[]>(`${environment.apiUrl}/Businesses/user/${userId}`)
        .subscribe({
          next: (data) => {

            console.log('Business Data:', data);

            if (data && data.length > 0) {

              const business = data[0];

              this.businessId = business.id;

              this.businessForm.patchValue({
                name: business.businessName,
                description: business.description,
                category: business.category,
                address: business.location
              });

              this.logoPreview = business.logoUrl
                ? this.normalizeUrl(business.logoUrl)
                : null;

            } else {
              this.errorMessage = 'No business found';
            }

            this.isLoading = false;
          },

          error: (err) => {
            console.error(err);
            this.errorMessage = 'Failed to load business';
            this.isLoading = false;
          }
        });
    });
  }

  onLogoSelected(event: any) {

    const file = event.target.files[0];

    if (file) {

      this.selectedLogoFile = file;

      const reader = new FileReader();

      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  saveChanges() {

    if (!this.businessId) return;

    const formData = new FormData();

    formData.append(
      'description',
      this.businessForm.get('description')?.value || ''
    );

    formData.append(
      'category',
      this.businessForm.get('category')?.value || ''
    );

    formData.append(
      'location',
      this.businessForm.get('address')?.value || ''
    );

    // Upload logo if selected
    if (this.selectedLogoFile) {
      formData.append('logo', this.selectedLogoFile);
    }

    this.http.put(
      `${environment.apiUrl}/Businesses/${this.businessId}`,
      formData
    ).subscribe({
      next: () => {
        this.successMessage = 'Business updated successfully';
        this.errorMessage = '';
      },

      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update business';
        this.successMessage = '';
      }
    });
  }
}
