import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.businessForm = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      description: [''],
      category: [''],
      phoneNumber: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.errorMessage = 'User not logged in';
      this.isLoading = false;
      return;
    }

    // Fetch business for this user
    this.http.get<any[]>(`${environment.apiUrl}/Businesses/Users/${userId}`).subscribe({
      next: (data) => {
        if (data.length > 0) {
          const business = data[0];
          this.businessId = business.id;

          // Patch values into form
          this.businessForm.patchValue({
            name: business.businessName,
            description: business.description,
            category: business.category,
            phoneNumber: business.phoneNumber,
            address: business.location
          });

          // Show existing logo
          this.logoPreview = business.logoUrl ? `${environment.apiUrl}/${business.logoUrl}` : null;

          this.isLoading = false;
        } else {
          this.errorMessage = 'No business found';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load business';
        this.isLoading = false;
      }
    });
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.businessId) return;

    const payload = {
      description: this.businessForm.get('description')?.value,
      category: this.businessForm.get('category')?.value,
      phoneNumber: this.businessForm.get('phoneNumber')?.value,
      location: this.businessForm.get('address')?.value,
      // you can handle logo separately in another API call if needed
    };

    this.http.put(`${environment.apiUrl}/Businesses/${this.businessId}`, payload).subscribe({
      next: () => this.successMessage = 'Business updated successfully',
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update business';
      }
    });
  }
}
