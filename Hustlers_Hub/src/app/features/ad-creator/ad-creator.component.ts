import { Component, OnInit } from '@angular/core';
import { PromotionProvider } from './Promotion';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe(data => {
      this.promotions = data;
    });
  }

  getUserId(): string {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return '';
      const parsed = JSON.parse(storedUser);
      return parsed?.userId || parsed?.id || parsed?.Id || '';
    } catch {
      return '';
    }
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
    if (this.isSubmitting) return; // Prevent double submit

    const userId = this.getUserId();

    if (!this.newPromo.title?.trim()) {
      alert('Please enter a promotion title.');
      return;
    }
    if (!this.newPromo.description?.trim()) {
      alert('Please enter a promotion description.');
      return;
    }
    if (!this.newPromo.category?.trim()) {
      alert('Please select a category.');
      return;
    }
    if (!this.selectedImageFiles || this.selectedImageFiles.length === 0) {
      alert('Please select at least one image.');
      return;
    }
    if (!userId) {
      alert('You must be logged in to create a promotion.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('Title', this.newPromo.title.trim());
    formData.append('Description', this.newPromo.description.trim());
    formData.append('Category', this.newPromo.category.trim());
    formData.append('PostedById', userId);
    formData.append('ExpiresAt', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
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
    this.imagePreviews = [];
    this.selectedImageFiles = [];
  }
}
