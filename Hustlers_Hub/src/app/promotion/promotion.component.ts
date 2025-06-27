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

  // Controls for search, filter and sort
  searchTerm: string = '';
  filterCategory: string = '';
  sortBy: string = 'expires';

  showCreateForm = false;

  newPromo: Promotion = {
    title: '',
    description: '',
    imageUrl: '',
    postedBy: 'Anonymous',
    expires: new Date(),
    category: ''
  };

  get uniqueCategories(): string[] {
    return [...new Set(this.promotions.map(p => p.category))];
  }

  get filteredPromotions(): Promotion[] {
    let filtered = [...this.promotions];

    // Search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (this.filterCategory) {
      filtered = filtered.filter(p => p.category === this.filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'postedBy':
          return a.postedBy.localeCompare(b.postedBy);
        default: // 'expires'
          return new Date(a.expires).getTime() - new Date(b.expires).getTime();
      }
    });

    return filtered;
  }

  openCreatePromoModal() {
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
