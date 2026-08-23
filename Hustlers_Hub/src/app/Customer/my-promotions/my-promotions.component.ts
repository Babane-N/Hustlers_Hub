import { Component, OnInit } from '@angular/core';
import { PromotionProvider, Promotion } from '../../promotion/Promotion';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-promotions',
  templateUrl: './my-promotions.component.html',
  styleUrls: ['./my-promotions.component.scss']
})
export class MyPromotionsComponent implements OnInit {

  promotions: Promotion[] = [];
  loading = true;
  repostingId: string | null = null;

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

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const uploadsUrl = environment.uploadsUrl
      .replace(/\/+$/, '');

    const cleanPath = imagePath
      .replace(/^\/+/, '')
      .replace(/^uploads\/?/i, '');

    return `${uploadsUrl}/${cleanPath}`;
  }

  async repostPromotion(promotion: Promotion): Promise<void> {

    if (this.repostingId) {
      return;
    }

    const confirmed = confirm(
      'Repost this promotion? A new promotion will be created using the same details and images.'
    );

    if (!confirmed) {
      return;
    }

    this.repostingId = promotion.id;

    try {

      const user = JSON.parse(
        localStorage.getItem('user') || '{}'
      );

      const userId = user.userId || user.id;

      if (!userId) {
        alert('You must be logged in to repost a promotion.');
        return;
      }

      const formData = new FormData();

      /*
       * Copy the original promotion details.
       */
      formData.append(
        'Title',
        promotion.title.trim()
      );

      formData.append(
        'Description',
        promotion.description.trim()
      );

      formData.append(
        'Category',
        promotion.category.trim()
      );

      /*
       * The repost belongs to the currently logged-in user.
       */
      formData.append(
        'PostedById',
        userId
      );

      /*
       * Give the repost a fresh 7-day lifespan,
       * just like creating a new promotion.
       */
      formData.append(
        'ExpiresAt',
        new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      );

      /*
       * A repost starts as a normal promotion.
       */
      formData.append(
        'IsBoosted',
        'false'
      );

      /*
       * Copy the existing images.
       */
      const images = promotion.images ?? [];

      if (!images.length) {
        alert(
          'This promotion does not have any images and cannot be reposted.'
        );

        return;
      }

      for (let i = 0; i < images.length; i++) {

        const imageUrl = this.getPromotionImageUrl(
          images[i]
        );

        const response = await fetch(imageUrl);

        if (!response.ok) {
          throw new Error(
            `Failed to download promotion image: ${imageUrl}`
          );
        }

        const blob = await response.blob();

        const extension =
          this.getFileExtension(
            imageUrl,
            blob.type
          );

        const fileName =
          `repost-${Date.now()}-${i}${extension}`;

        const file = new File(
          [blob],
          fileName,
          {
            type: blob.type || 'image/jpeg'
          }
        );

        formData.append(
          'Images',
          file,
          file.name
        );
      }

      /*
       * Create a completely new promotion.
       */
      this.promotionService
        .postPromotion(formData)
        .subscribe({
          next: (response) => {

            console.log(
              'Promotion reposted successfully:',
              response
            );

            /*
             * Add the new promotion to the top of the list.
             */
            this.promotions.unshift(response);

            alert(
              'Promotion reposted successfully!'
            );

            this.repostingId = null;
          },

          error: (err) => {

            console.error(
              'Failed to repost promotion:',
              err
            );

            alert(
              'Failed to repost promotion. Please try again.'
            );

            this.repostingId = null;
          }
        });

    } catch (error) {

      console.error(
        'Error preparing promotion repost:',
        error
      );

      alert(
        'Failed to prepare the promotion images. Please try again.'
      );

      this.repostingId = null;
    }
  }

  private getFileExtension(
    url: string,
    mimeType: string
  ): string {

    const cleanUrl = url.split('?')[0];

    const match = cleanUrl.match(
      /\.([a-zA-Z0-9]+)$/
    );

    if (match) {
      return `.${match[1]}`;
    }

    switch (mimeType) {

      case 'image/png':
        return '.png';

      case 'image/webp':
        return '.webp';

      case 'image/gif':
        return '.gif';

      case 'image/jpeg':
      case 'image/jpg':
      default:
        return '.jpg';
    }
  }

  deletePromotion(id: string): void {

    const confirmed = confirm(
      'Are you sure you want to delete this promotion?'
    );

    if (!confirmed) {
      return;
    }

    this.promotionService
      .deletePromotion(id)
      .subscribe({
        next: () => {

          this.promotions =
            this.promotions.filter(
              x => x.id !== id
            );
        },

        error: (err) => {

          console.error(
            'Failed to delete promotion:',
            err
          );
        }
      });
  }
}
