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

  loadPromotions() {

    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.loading = false;
      return;
    }

    this.promotionService
      .getMyPromotions(userId)
      .subscribe({
        next: (res) => {
          this.promotions = res;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
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
