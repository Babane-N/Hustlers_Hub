import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Promotion {
  id: string;
  title: string;
  description: string;
  category: string;
  postedById: string;
  isBoosted: boolean;
  createdAt: string;
  expiresAt: string;
  images?: string[]; // make optional
}

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent implements OnInit {
  promotions: Promotion[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  sortOrder: string = '';
  isLoading: boolean = false;
  readonly apiUrl = 'https://hustlershub-g3cjffaea3axckg3.southafricanorth-01.azurewebsites.net/api/promotions';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.isLoading = true;
    this.http.get<Promotion[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.promotions = data.map(p => ({
          ...p,
          images: (p.images ?? []).map(img => this.getPromotionImageUrl(img))
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading promotions:', err);
        this.isLoading = false;
      }
    });
  }

  getPromotionImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    return imagePath.startsWith('http')
      ? imagePath
      : `https://hustlershub-g3cjffaea3axckg3.southafricanorth-01.azurewebsites.net${imagePath}`;
  }

  handleImageError(promo: Promotion, imgUrl: string) {
    if (promo.images) {
      promo.images = promo.images.filter((i) => i !== imgUrl);
    }
  }

  filteredPromotions(): Promotion[] {
    let filtered = this.promotions;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(p =>
        p.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    if (this.sortOrder === 'newest') {
      filtered = filtered.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (this.sortOrder === 'oldest') {
      filtered = filtered.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return filtered;
  }
}

