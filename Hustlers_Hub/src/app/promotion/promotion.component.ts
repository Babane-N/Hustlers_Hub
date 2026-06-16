import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  readonly apiUrl = 'https://hustlershub-b4gsheczcebvgbew.southafricanorth-01.azurewebsites.net/api/promotions';
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {

    this.isLoading = true;

    this.http.get<any>(this.apiUrl).subscribe({

      next: (response) => {

        console.log(
          'Promotions Response:',
          response
        );

        const promotions =
          response?.data ?? [];

        this.promotions = promotions.map(
          (p: Promotion) => ({

            ...p,

            images: (p.images ?? []).map(
              img =>
                this.getPromotionImageUrl(img)
            )
          })
        );

        console.log(
          'Promotions loaded:',
          this.promotions
        );

        this.isLoading = false;
      },

      error: (err) => {

        console.error(
          '❌ Error loading promotions:',
          err
        );

        this.isLoading = false;
      }
    });
  }

  getPromotionImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    return imagePath.startsWith('http')
      ? imagePath
      : `https://hustlershub-b4gsheczcebvgbew.southafricanorth-01.azurewebsites.net${imagePath}`;
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

  createPromotion(): void {
    this.router.navigate(['/ad-creator']);
  }
}

