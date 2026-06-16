import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PromotionProvider } from './Promotion';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-ad-creator',
  templateUrl: './ad-creator.component.html',
  styleUrls: ['./ad-creator.component.scss']
})
export class AdCreatorComponent implements OnInit {

  promotions: any[] = [];

  newPromo = {
    title: '',
    description: '',
    category: ''
  };

  selectedImageFiles: File[] = [];
  imagePreviews: (string | ArrayBuffer | null)[] = [];
  isSubmitting = false;

  constructor(
    private promotionService: PromotionProvider,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe({
      next: (data) => {
        this.promotions = data;
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
      }
    });
  }

  onImagesSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      this.selectedImageFiles = Array.from(input.files);
      this.imagePreviews = [];

      this.selectedImageFiles.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = () => {
          this.imagePreviews[index] = reader.result;
        };

        reader.readAsDataURL(file);
      });
    }
  }

  submitPromotion(): void {

    if (this.isSubmitting) {
      return;
    }

    const userId = this.authService.getUserId();

    if (!userId) {
      alert('You must be logged in to create a promotion.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.newPromo.title.trim()) {
      alert('Please enter a promotion title.');
      return;
    }

    if (!this.newPromo.description.trim()) {
      alert('Please enter a promotion description.');
      return;
    }

    if (!this.newPromo.category.trim()) {
      alert('Please select a category.');
      return;
    }

    if (!this.selectedImageFiles.length) {
      alert('Please select at least one image.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    formData.append('Title', this.newPromo.title.trim());
    formData.append('Description', this.newPromo.description.trim());
    formData.append('Category', this.newPromo.category.trim());
    formData.append('PostedById', userId);

    formData.append(
      'ExpiresAt',
      new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString()
    );

    formData.append('IsBoosted', 'false');

    this.selectedImageFiles.forEach(file => {
      formData.append('Images', file, file.name);
    });

    this.promotionService.postPromotion(formData).subscribe({
      next: (response) => {

        alert('Promotion submitted successfully!');

        this.promotions.unshift(response);

        this.resetForm();

        this.isSubmitting = false;
      },

      error: (err) => {

        console.error('Error submitting promotion:', err);

        alert('Failed to submit promotion. Please try again.');

        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {

    this.newPromo = {
      title: '',
      description: '',
      category: ''
    };

    this.selectedImageFiles = [];
    this.imagePreviews = [];
  }
}
