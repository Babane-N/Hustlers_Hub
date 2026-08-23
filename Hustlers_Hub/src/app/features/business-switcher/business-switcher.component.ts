import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Business, BusinessService } from './BusinessModel';
import { ActiveServiceContextService } from '../../core/active-service-context.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-business-switcher',
  templateUrl: './business-switcher.component.html',
  styleUrls: ['./business-switcher.component.scss']
})
export class BusinessSwitcherComponent implements OnInit {

  businesses: Business[] = [];
  selectedBusinessId = '';

  constructor(
    private businessService: BusinessService,
    private authService: AuthService,
    private activeServiceContext: ActiveServiceContextService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.businessService.getUserBusinesses(user.id).subscribe({
      next: (businesses) => {
        this.businesses = businesses.map(business => ({
          ...business,
          imageUrl: business.logoUrl
            ? this.getImageUrl(business.logoUrl)
            : business.logoUrl
        }));
      },
      error: (err) => {
        console.error('Failed to load businesses', err);
      }
    });
  }

  /**
   * Converts a stored image path into the correct production image URL.
   *
   * Handles values such as:
   * /uploads/image.png
   * uploads/image.png
   * /image.png
   * image.png
   */
  private getImageUrl(url: string): string {
    if (!url) {
      return '';
    }

    // Already an absolute URL
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const baseUrl = environment.uploadsUrl.replace(/\/+$/, '');

    const cleanUrl = url
      .replace(/^\/+/, '')
      .replace(/^uploads\/?/i, '');

    return `${baseUrl}/${cleanUrl}`;
  }

  onSwitchBusiness(business: Business): void {
    this.activeServiceContext.setActiveBusiness({
      id: business.id,
      businessName: business.businessName,
      businessType: business.businessType,
      isApproved: business.isApproved
    });

    this.router.navigate(['/dashboard']);
  }
}

