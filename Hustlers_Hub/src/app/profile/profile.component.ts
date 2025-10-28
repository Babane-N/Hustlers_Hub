import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface UserProfile { id: string; fullName: string; email: string; phoneNumber?: string; profileImage?: string; userType: string; }

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user!: UserProfile;
  isLoading = true;
  errorMessage = '';
  profilePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  uploadsUrl = environment.uploadsUrl;

  private baseUrl = `${environment.apiUrl}/Users`;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser?.userId) { this.router.navigate(['/login']); return; }

    this.http.get<UserProfile>(`${this.baseUrl}/${storedUser.userId}`).subscribe({
      next: (data) => { this.user = data; this.initForm(); this.isLoading = false; },
      error: () => { this.errorMessage = 'Failed to load profile'; this.isLoading = false; }
    });
  }

  private initForm() {
    this.profileForm = this.fb.group({
      fullName: [this.user.fullName, Validators.required],
      email: [{ value: this.user.email, disabled: true }],
      phoneNumber: [this.user.phoneNumber],
      profileImage: ['']
    });

    this.profilePreview = this.user.profileImage ? `${this.uploadsUrl}/${this.user.profileImage}` : null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.profilePreview = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    const formData = new FormData();
    formData.append('id', this.user.id);
    formData.append('fullName', this.profileForm.value.fullName);
    formData.append('phoneNumber', this.profileForm.value.phoneNumber || '');
    if (this.selectedFile) formData.append('profileImage', this.selectedFile);

    this.http.put(`${this.baseUrl}/${this.user.id}`, formData).subscribe({
      next: () => { alert('Profile updated successfully!'); this.router.navigate(['/dashboard']); },
      error: () => (this.errorMessage = 'Update failed. Please try again.')
    });
  }
}
