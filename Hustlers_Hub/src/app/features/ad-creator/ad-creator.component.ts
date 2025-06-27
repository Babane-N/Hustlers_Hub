import { Component } from '@angular/core';

@Component({
  selector: 'app-ad-creator',
  templateUrl: './ad-creator.component.html',
  styleUrl: './ad-creator.component.scss'
})
export class AdCreatorComponent {
  newPromo = {
    title: '',
    description: '',
    imageUrl: '',
    user: 'Anonymous', // Ideally, replace with logged-in user info
    date: new Date()
  };

  promotions = [
    {
      title: 'Summer Sale!',
      description: 'Get 20% off on all services this summer.',
      imageUrl: 'https://via.placeholder.com/300x180?text=Summer+Sale',
      user: 'John Doe',
      date: new Date('2025-06-01')
    },
    // add more sample promos here...
  ];

  submitPromotion() {
    if (
      this.newPromo.title.trim() &&
      this.newPromo.description.trim() &&
      this.newPromo.imageUrl.trim()
    ) {
      this.newPromo.date = new Date();
      this.promotions.unshift({ ...this.newPromo });
      this.newPromo.title = '';
      this.newPromo.description = '';
      this.newPromo.imageUrl = '';
    }
  }

}
