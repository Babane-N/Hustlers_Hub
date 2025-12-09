import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Business, BusinessService } from './BusinessModel';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-business-switcher',
  templateUrl: './business-switcher.component.html',
  styleUrls: ['./business-switcher.component.scss']
})
export class BusinessSwitcherComponent implements OnInit {
  businesses: Business[] = [];
  selectedBusinessId: string = '';

  constructor(
    private businessService: BusinessService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();   // ✅ decode from JWT

    if (user?.id) {
      const userId = user.id;

      this.businessService.getUserBusinesses(userId).subscribe({
        next: (data) => (this.businesses = data),
        error: (err) => console.error(err)
      });

    } else {
      console.error('User not logged in or invalid token.');
      this.router.navigate(['/login']);
    }
  }

  onSwitchBusiness(businessId: string) {
    this.selectedBusinessId = businessId;
    localStorage.setItem('activeBusinessId', businessId);

    const selected = this.businesses.find(b => b.id === businessId);
    if (selected) {
      localStorage.setItem('activeBusinessData', JSON.stringify(selected));
    }

    this.router.navigate(['/home']);
  }
}
