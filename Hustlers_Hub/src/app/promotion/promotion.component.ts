import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Promotion, PromotionProvider } from './Promotion';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent implements OnInit {
  environment = environment;

  promotions: (Promotion & { images: string[] })[] = [];
  searchTerm = '';
  filterCategory = '';
  sortBy: 'title' | 'postedBy' | 'expiresAt' = 'expiresAt';
  showCreateForm = false;

  formData: Partial<Promotion> = {
    title: '',
    description: '',
    category: '',
    expiresAt: new Date(),
    postedBy: this.getUserFullName()
  };

  selectedFiles: File[] = [];

  constructor(
    private router: Router,
    private promotionService: PromotionProvider
  ) { }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    const baseUrl = environment.apiUrl; // Ensure ends with /api

    this.promotionService.getPromotions().subscribe(data => {
      this.promotions = data.map(p => ({
        ...p,
        images: Array.isArray(p.images)
          ? p.images.map(img => img.startsWith('http') ? img : `${baseUrl}/promotions/${img}`)
          : [],
        expiresAt: p.expiresAt ? new Date(p.expiresAt) : new Date(),
        postedBy: p.postedBy || this.getUserFullName()
      }));

      console.log('Promotions loaded:', this.promotions);
    });
  }

  getPromotionImageUrl(promo: Promotion & { images: string[] }): string | null {
    return promo.images && promo.images.length > 0 ? promo.images[0] : null; // null = no image
  }

  getUserId(): string {
    const userJson = localStorage.getItem('user');
    if (!userJson) return '';
    try {
      const user = JSON.parse(userJson);
      return user?.userId || user?.id || '';
    } catch {
      return '';
    }
  }

  getUserFullName(): string {
    const userJson = localStorage.getItem('user');
    if (!userJson) return 'Anonymous';
    try {
      const user = JSON.parse(userJson);
      return user?.fullName || user?.name || 'Anonymous';
    } catch {
      return 'Anonymous';
    }
  }

  submitPromotion(): void {
    if (
      this.formData.title?.trim() &&
      this.formData.description?.trim() &&
      this.formData.category?.trim() &&
      this.selectedFiles.length > 0
    ) {
      const userId = this.getUserId();
      if (!userId) {
        alert('You must be logged in to post a promotion.');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('Title', this.formData.title!.trim());
      formDataToSend.append('Description', this.formData.description!.trim());
      formDataToSend.append('Category', this.formData.category!.trim());
      formDataToSend.append('ExpiresAt', this.formData.expiresAt?.toISOString() ?? new Date().toISOString());
      formDataToSend.append('PostedById', userId);
      formDataToSend.append('IsBoosted', 'false');

      this.selectedFiles.forEach(file => {
        formDataToSend.append('Images', file, file.name);
      });

      this.promotionService.postPromotion(formDataToSend).subscribe({
        next: () => {
          this.loadPromotions();
          this.resetForm();
          this.showCreateForm = false;
        },
        error: err => {
          console.error('Error saving promotion:', err);
          alert('Error saving promotion.');
        }
      });
    } else {
      alert('Please fill in all fields and select at least one image.');
    }
  }

  onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFiles = Array.from(target.files);
    }
  }

  openCreatePromoModal(): void {
    this.showCreateForm = true;
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.resetForm();
  }

  get uniqueCategories(): string[] {
    const categories = this.promotions.map(p => p.category);
    return Array.from(new Set(categories));
  }

  get filteredPromotions(): (Promotion & { images: string[] })[] {
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
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
    });

    return filtered;
  }

  goToAdCreator(): void {
    this.router.navigate(['/adcreator']);
  }

  private resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      category: '',
      expiresAt: new Date(),
      postedBy: this.getUserFullName()
    };
    this.selectedFiles = [];
  }
}
