import { Component } from '@angular/core';

interface Promotion {
  title: string;
  description: string;
  imageUrl: string;
  postedBy: string;
  expires: Date;
  category: string;
}

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent {
  promotions: Promotion[] = [
    {
      title: 'Summer Sale!',
      description: 'Get 20% off all local services this summer.',
      imageUrl: 'https://via.placeholder.com/300x160?text=Summer+Sale',
      postedBy: 'John Doe',
      expires: new Date('2025-07-31'),
      category: 'Sales'
    },
    {
      title: 'Fitness Bootcamp',
      description: 'Join our free fitness bootcamp every Saturday morning.',
      imageUrl: 'https://via.placeholder.com/300x160?text=Fitness+Bootcamp',
      postedBy: 'Jane Smith',
      expires: new Date('2025-06-30'),
      category: 'Events'
    }
  ];

  showCreateForm = false;

  newPromo: Promotion = {
    title: '',
    description: '',
    imageUrl: '',
    postedBy: 'Anonymous',
    expires: new Date(),
    category: ''
  };

  openCreatePromoModal() {
    // For simplicity, toggle a form inline.
    this.showCreateForm = true;
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.resetForm();
  }

  submitPromotion() {
    if (
      this.newPromo.title.trim() &&
      this.newPromo.description.trim() &&
      this.newPromo.imageUrl.trim() &&
      this.newPromo.category.trim()
    ) {
      // Push new promo to top of list
      this.promotions.unshift({
        ...this.newPromo,
        postedBy: 'You',
        expires: new Date(this.newPromo.expires)
      });
      this.resetForm();
      this.showCreateForm = false;
    } else {
      alert('Please fill all fields.');
    }
  }

  private resetForm() {
    this.newPromo = {
      title: '',
      description: '',
      imageUrl: '',
      postedBy: 'Anonymous',
      expires: new Date(),
      category: ''
    };
  }
}
