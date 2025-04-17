import { Component } from '@angular/core';

@Component({
  selector: 'app-find-service',
  templateUrl: './find-service.component.html',
  styleUrls: ['./find-service.component.scss']
})
export class FindServiceComponent {
  searchTerm = '';

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

  get filteredProviders() {
    if (!this.searchTerm) return this.serviceProviders;

    const term = this.searchTerm.toLowerCase();
    return this.serviceProviders.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.service.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term)
    );
  }

  search() {
    // You could trigger a real API call here later
    console.log('Searching for:', this.searchTerm);
  }
}
