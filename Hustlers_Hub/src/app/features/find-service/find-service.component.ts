import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceProviderService } from './ServiceProvider';
import { environment } from '../../../environments/environment';

export interface ServiceProvider {
  id: string;
  title: string;
  category: string;
  description?: string;
  businessName: string;
  businessLocation?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string | null;
  imageUrl?: string | null;
  hiddenImage?: boolean;
  isVerified?: boolean;
}

@Component({
  selector: 'app-find-service',
  templateUrl: './find-service.component.html',
  styleUrls: ['./find-service.component.scss']
})
export class FindServiceComponent implements OnInit, AfterViewInit {

  serviceProviders: ServiceProvider[] = [];
  searchTerm = '';
  selectedService = '';
  sortBy: 'name' | 'location' = 'name';
  viewMode: 'list' | 'map' = 'list';
  center: google.maps.LatLngLiteral = { lat: -26.2041, lng: 28.0473 };
  zoom = 11;

  uploadsUrl = environment.uploadsUrl;

  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private providerService: ServiceProviderService
  ) { }

  ngOnInit(): void {
    this.loadProviders();
  }

  private loadProviders(): void {
    this.providerService.getProviders().subscribe({
      next: providers => {
        this.serviceProviders = providers.map(p => ({
          ...p,
          // Normalize logo & image URLs
          logoUrl: this.normalizeUrl(p.logoUrl),
          imageUrl: this.normalizeUrl(p.imageUrl),
          hiddenImage: false,
          isVerified: p.isVerified ?? false
        }));
      },
      error: err => console.error('Error loading providers:', err)
    });
  }

  ngAfterViewInit(): void {
    if (!this.locationInput) return;

    const autocomplete = new google.maps.places.Autocomplete(
      this.locationInput.nativeElement,
      { fields: ['geometry', 'formatted_address'], types: ['geocode'] }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        this.center = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        this.zoom = 13;
      }
    });
  }

  toggleView(mode: 'list' | 'map'): void { this.viewMode = mode; }
  goToRegisterBusiness(): void { this.router.navigate(['/register-business']); }
  goFindServiceDetail(provider: ServiceProvider): void {
    if (provider?.id) this.router.navigate(['/service-detail', provider.id]);
  }
  hideImage(provider: ServiceProvider): void { provider.hiddenImage = true; }

  get uniqueServices(): string[] {
    return [...new Set(this.serviceProviders.map(p => p.category))];
  }

  get filteredProviders(): ServiceProvider[] {
    let result = [...this.serviceProviders];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.businessName.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.businessLocation?.toLowerCase().includes(term) ?? false)
      );
    }
    if (this.selectedService) result = result.filter(p => p.category === this.selectedService);
    if (this.sortBy === 'name') result.sort((a, b) => a.businessName.localeCompare(b.businessName));
    else result.sort((a, b) => (a.businessLocation || '').localeCompare(b.businessLocation || ''));
    return result;
  }

  get mapMarkers() {
    return this.filteredProviders
      .filter(p => p.latitude && p.longitude)
      .map(p => ({ position: { lat: p.latitude!, lng: p.longitude! }, title: p.businessName, provider: p }));
  }

  getServiceImage(provider: ServiceProvider): string | null {
    if (!provider.imageUrl || provider.hiddenImage) return null;
    return provider.imageUrl;
  }

  // 🔹 Normalize URLs for logo or image
  private normalizeUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${this.uploadsUrl.replace(/\/+$/, '')}/${url.replace(/^\/+|uploads\/?/g, '')}`;
  }
}
