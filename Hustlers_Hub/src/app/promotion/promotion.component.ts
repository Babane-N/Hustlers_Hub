import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Promotion, PromotionProvider } from './Promotion';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent implements OnInit {
  promotions: Promotion[] = [];
  searchTerm = '';
  filterCategory = '';
  sortBy = 'expires'; // Default sort
  showCreateForm = false;

  // Model for form input (bound in template)
  formData: Partial<Promotion> = {
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    expires: new Date(),
    postedBy: 'Anonymous'
  };

  constructor(
    private router: Router,
    private promotionService: PromotionProvider
  ) { }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.promotionService.getPromotion().subscribe(data => {
      this.promotions = data;
    });
  }

  goToAdCreator(): void {
    this.router.navigate(['/adcreator']);
  }

  get uniqueCategories(): string[] {
    return [...new Set(this.promotions.map(p => p.category))];
  }

  get filteredPromotions(): Promotion[] {
    let filtered = [...this.promotions];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    if (this.filterCategory) {
      filtered = filtered.filter(p => p.category === this.filterCategory);
    }

    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'postedBy':
          return a.postedBy.localeCompare(b.postedBy);
        default:
          return new Date(a.expires).getTime() - new Date(b.expires).getTime();
      }
    });

    return filtered;
  }

  openCreatePromoModal(): void {
    this.showCreateForm = true;
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.resetForm();
  }

  submitPromotion(): void {
    if (
      this.formData.title?.trim() &&
      this.formData.description?.trim() &&
      this.formData.imageUrl?.trim() &&
      this.formData.category?.trim()
    ) {
      const newPromotion: Promotion = {
        title: this.formData.title,
        description: this.formData.description,
        imageUrl: this.formData.imageUrl,
        category: this.formData.category,
        expires: new Date(this.formData.expires ?? new Date()),
        postedBy: this.formData.postedBy || 'Anonymous'
      };

      this.promotionService.postPromotion(newPromotion).subscribe({
        next: () => {
          this.loadPromotions(); // Refresh from backend
          this.resetForm();
          this.showCreateForm = false;
        },
        error: () => alert('Error saving promotion.')
      });
    } else {
      alert('Please fill in all fields.');
    }
  }

  private resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      imageUrl: '',
      category: '',
      expires: new Date(),
      postedBy: 'Anonymous'
    };
  }
}
