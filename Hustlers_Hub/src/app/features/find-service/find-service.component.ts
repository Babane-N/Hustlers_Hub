import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-find-service',
  templateUrl: './find-service.component.html',
  styleUrls: ['./find-service.component.scss']
})
export class FindServiceComponent {
  constructor(private router: Router) { }

  searchTerm = '';
  selectedService = '';
  sortBy = 'name';

  serviceProviders = [
    {
      name: 'Lebo Dlamini',
      service: 'Electrician',
      location: 'Johannesburg',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      description: 'Specialist in home wiring and appliance repairs.'
    },
    {
      name: 'Thandi Mokoena',
      service: 'House Cleaner',
      location: 'Pretoria',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      description: 'Reliable and efficient cleaning for homes and offices.'
    },
    {
      name: 'Sbu Khumalo',
      service: 'Fitness Trainer',
      location: 'Durban',
      image: 'https://randomuser.me/api/portraits/men/55.jpg',
      description: 'Helping clients stay fit with custom workout plans.'
    }
  ];

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
