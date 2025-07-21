import { Component, OnInit } from '@angular/core';
import { Business, BusinessService } from './BusinessModel'; // Make sure path is correct

@Component({
  selector: 'app-business-switcher',
  templateUrl: './business-switcher.component.html',
  styleUrls: ['./business-switcher.component.scss']
})
export class BusinessSwitcherComponent implements OnInit {
  businesses: Business[] = [];
  selectedBusinessId: string = ''; // ✅ Tracks the selected business

  constructor(private businessService: BusinessService) { }

  ngOnInit(): void {
    const userId = 'E1111111-AAAA-1111-AAAA-111111111111'; // Replace with real user ID from auth
    this.businessService.getUserBusinesses(userId).subscribe(data => {
      this.businesses = data;

      // ✅ Optional: auto-select first business
      if (data.length > 0) {
        this.selectedBusinessId = data[0].id;
      }
    });
  }

  // ✅ Called when the user switches businesses
  onSwitchBusiness(businessId: string): void {
    console.log('Switched to business:', businessId);
    // TODO: Update global state or route as needed
  }
}
