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
    return [...new Set(this.serviceProviders.map(p => p.service))];
  }

  get filteredProviders() {
    let result = [...this.serviceProviders];

    // Search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.service.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term)
      );
    }

    // Filter by service
    if (this.selectedService) {
      result = result.filter(p => p.service === this.selectedService);
    }

    // Sort
    result.sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (this.sortBy === 'location') {
        return a.location.localeCompare(b.location);
      }
      return 0;
    });

    return result;
  }

  goFindServiceDetail() {
    this.router.navigate(['./service-detail']);
  }
}
