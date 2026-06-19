import { Component, OnInit } from '@angular/core';
import { PromotionProvider, Promotion } from '../../promotion/Promotion';

@Component({
  selector: 'app-my-promotions',
  templateUrl: './my-promotions.component.html',
  styleUrls: ['./my-promotions.component.scss']
})
export class MyPromotionsComponent implements OnInit {

  promotions: Promotion[] = [];
  loading = true;

  constructor(
    private promotionService: PromotionProvider
  ) { }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {

    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    const userId = user.userId || user.id;

    console.log('User:', user);
    console.log('UserId:', userId);

    if (!userId) {

      console.error('No user id found');

      this.loading = false;

      return;
    }

    this.promotionService
      .getMyPromotions(userId)
      .subscribe({
        next: (res) => {

          console.log('Promotions:', res);

          this.promotions = res;

          this.loading = false;
        },

        error: (err) => {

          console.error('Promotion Error:', err);

          this.loading = false;
        }
      });
  }

  getPromotionImageUrl(imagePath: string): string {

    if (!imagePath) {
      return '';
    }

    return imagePath.startsWith('http')
      ? imagePath
      : `https://hustlershub-b4gsheczcebvgbew.southafricanorth-01.azurewebsites.net${imagePath}`;
  }

  editPromotion(promotion: Promotion) {
    console.log('Edit', promotion);
  }

  deletePromotion(id: string) {

    const confirmed = confirm(
      'Are you sure you want to delete this promotion?'
    );

    if (!confirmed) return;

    this.promotionService
      .deletePromotion(id)
      .subscribe({
        next: () => {
          this.promotions =
            this.promotions.filter(x => x.id !== id);
        }
      });
  }
}
