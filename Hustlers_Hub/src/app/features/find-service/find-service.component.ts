import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceProviderService, ServiceProvider } from './ServiceProvider';

@Component({
  selector: 'app-find-service',
  templateUrl: './find-service.component.html',
  styleUrls: ['./find-service.component.scss']
})
export class FindServiceComponent implements OnInit {
  constructor(
    private router: Router,
    private providerService: ServiceProviderService // ✅ Fixed service injection
  ) { }

  searchTerm = '';
  selectedService = '';
  sortBy = 'name';

  serviceProviders: ServiceProvider[] = [];

  ngOnInit(): void {
    this.providerService.getProviders().subscribe(data => {
      this.serviceProviders = data;
    });
  }

  get uniqueServices(): string[] {
    return [...new Set(this.serviceProviders.map(p => p.category))];
  }

  get filteredProviders() {
    let result = [...this.serviceProviders];

    // Search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.businessName.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.businessLocation.toLowerCase().includes(term)
      );
    }

    // Filter by service
    if (this.selectedService) {
      result = result.filter(p => p.category === this.selectedService);
    }

    // Sort
    result.sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.businessName.localeCompare(b.businessName);
      } else if (this.sortBy === 'location') {
        return a.businessLocation.localeCompare(b.businessLocation);
      }
      return 0;
    });

    return result;
  }

  goFindServiceDetail() {
    this.router.navigate(['./service-detail']);
  }
}
