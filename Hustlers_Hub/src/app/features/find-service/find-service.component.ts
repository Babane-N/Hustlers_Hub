import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceProviderService, ServiceProvider } from './ServiceProvider';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-find-service',
  templateUrl: './find-service.component.html',
  styleUrls: ['./find-service.component.scss']
})
export class FindServiceComponent implements OnInit, AfterViewInit {
  serviceProviders: ServiceProvider[] = [];
  searchTerm = '';
  selectedService = '';
  sortBy = 'name';
  viewMode: 'list' | 'map' = 'list';
  center: google.maps.LatLngLiteral = { lat: -26.2041, lng: 28.0473 };
  zoom = 11;
  environment = environment; // expose it to the template


  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  uploadsUrl = environment.apiUrl;

  constructor(private router: Router, private providerService: ServiceProviderService) { }

  ngOnInit(): void {
    this.providerService.getProviders().subscribe({
      next: (data) => this.serviceProviders = data,
      error: (err) => console.error('Error loading providers:', err)
    });
  }

  ngAfterViewInit(): void {
    if (this.locationInput) {
      const autocomplete = new google.maps.places.Autocomplete(this.locationInput.nativeElement, {
        fields: ['geometry', 'formatted_address'],
        types: ['geocode']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          this.center = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
          this.zoom = 13;
        }
      });
    }
  }

  toggleView(mode: 'list' | 'map') { this.viewMode = mode; }

  goToRegisterBusiness() { this.router.navigate(['/register-business']); }

  get uniqueServices(): string[] { return [...new Set(this.serviceProviders.map(p => p.category))]; }

  get filteredProviders(): ServiceProvider[] {
    let result = [...this.serviceProviders];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.businessName.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.businessLocation?.toLowerCase().includes(term)
      );
    }
    if (this.selectedService) result = result.filter(p => p.category === this.selectedService);
    if (this.sortBy === 'name') result.sort((a, b) => a.businessName.localeCompare(b.businessName));
    else if (this.sortBy === 'location') result.sort((a, b) => (a.businessLocation || '').localeCompare(b.businessLocation || ''));
    return result;
  }

  get mapMarkers() {
    return this.filteredProviders.filter(p => p.latitude && p.longitude)
      .map(p => ({ position: { lat: p.latitude!, lng: p.longitude! }, title: p.businessName, provider: p }));
  }

  goFindServiceDetail(provider: ServiceProvider) {
    if (provider?.id) this.router.navigate(['/service-detail', provider.id]);
  }
}
