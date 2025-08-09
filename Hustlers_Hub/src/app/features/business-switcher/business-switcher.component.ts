import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Business, BusinessService } from './BusinessModel';

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
    private router: Router
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user?.userId) {
      const userId = user.userId;
      this.businessService.getUserBusinesses(userId).subscribe(data => {
        this.businesses = data;
      });
    } else {
      console.error('User not found in localStorage.');
      this.router.navigate(['/login']);
    }
  }

  onSwitchBusiness(businessId: string) {
    this.selectedBusinessId = businessId;

    // Store in localStorage or a shared service
    localStorage.setItem('activeBusinessId', businessId);

    // Optionally, store the whole business object
    const selected = this.businesses.find(b => b.id === businessId);
    if (selected) {
      localStorage.setItem('activeBusinessData', JSON.stringify(selected));
    }

    // Redirect to dashboard/home
    this.router.navigate(['/home']);
  }
}
