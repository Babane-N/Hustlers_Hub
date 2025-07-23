import { Component } from '@angular/core';
import { Promotion, PromotionProvider } from './Promotion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ad-creator',
  templateUrl: './ad-creator.component.html',
  styleUrls: ['./ad-creator.component.scss']
})
export class AdCreatorComponent {
  promotions: any[] = [];

  newPromo = {
    title: '',
    description: '',
    imageUrl: '',
    user: 'Anonymous',
    date: new Date(),
    category: ''
  };

  selectedImageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private promotionService: PromotionProvider,
    private router: Router
  ) { }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.newPromo.imageUrl = reader.result?.toString() || '';
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  submitPromotion(): void {
    if (
      this.newPromo.title.trim() &&
      this.newPromo.description.trim() &&
      this.newPromo.imageUrl.trim() &&
      this.newPromo.category.trim()
    ) {
      const promotionToSend = {
        title: this.newPromo.title,
        description: this.newPromo.description,
        imageUrl: this.newPromo.imageUrl, // base64 string
        postedBy: this.newPromo.user,
        expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        category: this.newPromo.category
      };

      this.promotionService.postPromotion(promotionToSend).subscribe({
        next: (response) => {
          this.promotions.unshift(response);
          this.resetForm();
        },
        error: (err) => {
          console.error('Failed to submit promotion:', err);
        }
      });
    } else {
      alert('Please fill all fields.');
    }
  }

  resetForm(): void {
    this.newPromo = {
      title: '',
      description: '',
      imageUrl: '',
      user: 'Anonymous',
      date: new Date(),
      category: ''
    };
    this.imagePreview = null;
    this.selectedImageFile = null;
  }
}
