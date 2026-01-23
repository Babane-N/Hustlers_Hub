import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Business, BusinessService } from './BusinessModel';
import { ActiveServiceContextService } from '../../core/active-service-context.service';
import { AuthService } from '../auth/auth.service';

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

    // ✅ Load businesses instead of services
    this.businessService.getUserBusinesses(user.id).subscribe({
      next: businesses => this.businesses = businesses,
      error: err => console.error('Failed to load businesses', err)
    });
  }

  onSwitchBusiness(business: Business): void {
    // ✅ Set active business context
    this.activeServiceContext.setActiveBusiness({
      id: business.id,
      businessName: business.businessName,
      businessType: business.businessType, // optional, if you track verified/unverified
      isApproved: business.isApproved      // optional
    });

    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }
}

