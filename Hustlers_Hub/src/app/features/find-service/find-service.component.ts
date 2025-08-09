import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceProviderService, ServiceProvider } from './ServiceProvider';

@Component({
  selector: 'app-find-service',
  templateUrl: './find-service.component.html',
  styleUrls: ['./find-service.component.scss']
})
export class FindServiceComponent implements OnInit {
  serviceProviders: ServiceProvider[] = [];
  searchTerm = '';
  selectedService = '';
  sortBy = 'name';

  constructor(
    private router: Router,
    private providerService: ServiceProviderService
  ) { }

  ngOnInit(): void {
    this.providerService.getProviders().subscribe({
      next: (data) => this.serviceProviders = data,
      error: (err) => console.error('Error loading service providers:', err)
    });
  }

  goToRegisterBusiness(): void {
    this.router.navigate(['/register-business']);
  }

  get uniqueServices(): string[] {
    return [...new Set(this.serviceProviders.map(p => p.category))];
  }

  get filteredProviders(): ServiceProvider[] {
    let result = [...this.serviceProviders];

    // 🔍 Search by name, category, or location
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.businessName.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.businessLocation.toLowerCase().includes(term)
      );
    }

    // 🎯 Filter by selected category
    if (this.selectedService) {
      result = result.filter(p => p.category === this.selectedService);
    }

    // 🔤 Sort
    if (this.sortBy === 'name') {
      result.sort((a, b) => a.businessName.localeCompare(b.businessName));
    } else if (this.sortBy === 'location') {
      result.sort((a, b) => a.businessLocation.localeCompare(b.businessLocation));
    }

    return result;
  }

  goFindServiceDetail(provider: ServiceProvider): void {
    if (provider?.id) {
      this.router.navigate(['/service-detail', provider.id]);
    }
  }
}
