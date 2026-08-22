import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';

import { Router } from '@angular/router';
import { ServiceProviderService } from './ServiceProvider';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ServiceProvider {

  id: string;
  title: string;
  category: string;
  description?: string;
  businessName: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  score?: number;
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
export class FindServiceComponent
  implements OnInit, AfterViewInit {
  serviceProviders: ServiceProvider[] = [];
  searchTerm = '';
  selectedService = '';
  sortBy: 'rank' | 'name' | 'location' = 'rank';
  viewMode: 'list' | 'map' = 'list';
  isLoading = true;

  center: google.maps.LatLngLiteral = {
    lat: -26.2041,
    lng: 28.0473
  };

  zoom = 11;

  uploadsUrl = environment.uploadsUrl;

  // ✅ FIXED
  userLatitude: number = 0;
  userLongitude: number = 0;

  @ViewChild('locationInput')
  locationInput!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private providerService: ServiceProviderService
  ) { }

  // =====================================================
  // INIT
  // =====================================================
  ngOnInit(): void {

    // Get user's location
    navigator.geolocation.getCurrentPosition(

      // ✅ FIXED TYPE
      (position: GeolocationPosition) => {

        this.userLatitude =
          position.coords.latitude;

        this.userLongitude =
          position.coords.longitude;

        // Center map on user
        this.center = {
          lat: this.userLatitude,
          lng: this.userLongitude
        };

        this.zoom = 12;

        this.loadProviders();
      },

      // Error callback
      (error: GeolocationPositionError) => {

        console.warn(
          'Location permission denied:',
          error.message
        );

        // Load without coordinates
        this.loadProviders();
      }
    );
  }

  // =====================================================
  // LOAD PROVIDERS
  // =====================================================
  // =====================================================
  // LOAD PROVIDERS
  // =====================================================
  private loadProviders(): void {

    // Show loading message
    this.isLoading = true;

    this.providerService
      .getProviders(
        this.userLatitude,
        this.userLongitude
      )
      .pipe(
        finalize(() => {
          // Hide loading message when request completes
          // whether successful or failed
          this.isLoading = false;
        })
      )
      .subscribe({

        next: (response: any) => {

          const providers =
            response?.data ?? [];

          this.serviceProviders =
            providers.map((p: ServiceProvider) => ({

              ...p,

              logoUrl: this.normalizeUrl(
                p.logoUrl
              ),

              imageUrl: this.normalizeUrl(
                p.imageUrl
              ),

              hiddenImage: false,

              isVerified:
                p.isVerified ?? false
            }));

          console.log(
            'Providers loaded:',
            this.serviceProviders
          );

          console.table(
            this.serviceProviders.map(p => ({
              business: p.businessName,
              score: p.score,
              distance: p.distance
            }))
          );
        },

        error: (err) => {

          console.error(
            'Error loading providers:',
            err
          );
        }
      });
  }

  // =====================================================
  // GOOGLE AUTOCOMPLETE
  // =====================================================
  ngAfterViewInit(): void {

    if (!this.locationInput) return;

    const autocomplete =
      new google.maps.places.Autocomplete(
        this.locationInput.nativeElement,
        {
          fields: [
            'geometry',
            'formatted_address'
          ],
          types: ['geocode']
        }
      );

    autocomplete.addListener(
      'place_changed',
      () => {

        const place =
          autocomplete.getPlace();

        if (place.geometry?.location) {

          this.center = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          this.zoom = 13;
        }
      }
    );
  }

  // =====================================================
  // UI ACTIONS
  // =====================================================
  toggleView(
    mode: 'list' | 'map'
  ): void {

    this.viewMode = mode;
  }

  goToRegisterBusiness(): void {

    this.router.navigate([
      '/register-business'
    ]);
  }

  goFindServiceDetail(
    provider: ServiceProvider
  ): void {

    if (provider?.id) {

      this.router.navigate([
        '/service-detail',
        provider.id
      ]);
    }
  }

  hideImage(
    provider: ServiceProvider
  ): void {

    provider.hiddenImage = true;
  }

  // =====================================================
  // UNIQUE SERVICES
  // =====================================================
  get uniqueServices(): string[] {

    return [

      ...new Set(
        this.serviceProviders.map(
          p => p.category
        )
      )
    ];
  }

  // =====================================================
  // FILTERED PROVIDERS
  // =====================================================
  get filteredProviders(): ServiceProvider[] {

    let result = [
      ...this.serviceProviders
    ];

    // Search
    if (this.searchTerm.trim()) {

      const term =
        this.searchTerm.toLowerCase();

      result = result.filter(p =>

        p.businessName
          .toLowerCase()
          .includes(term)

        ||

        p.category
          .toLowerCase()
          .includes(term)

        ||

        (
          p.location
            ?.toLowerCase()
            .includes(term)
          ?? false
        )
      );
    }

    // Category filter
    if (this.selectedService) {

      result = result.filter(
        p =>
          p.category ===
          this.selectedService
      );
    }

    // Ranking (default)
    if (this.sortBy === 'rank') {

      result.sort((a, b) =>

        (b.score ?? 0) -
        (a.score ?? 0)
      );
    }

    // Alphabetical
    else if (this.sortBy === 'name') {

      result.sort((a, b) =>

        a.businessName.localeCompare(
          b.businessName
        )
      );
    }

    // Location
    else {

      result.sort((a, b) =>

        (a.location || '')
          .localeCompare(
            b.location || ''
          )
      );
    }

    return result;
  }


  // =====================================================
  // MAP MARKERS
  // =====================================================
  get mapMarkers() {

    return this.filteredProviders

      .filter(p =>

        p.latitude !== undefined &&
        p.longitude !== undefined
      )

      .map(p => ({

        position: {
          lat: p.latitude!,
          lng: p.longitude!
        },

        title: p.businessName,

        provider: p
      }));
  }

  // =====================================================
  // SERVICE IMAGE
  // =====================================================
  getServiceImage(
    provider: ServiceProvider
  ): string | null {

    if (
      !provider.imageUrl ||
      provider.hiddenImage
    ) {
      return null;
    }

    return provider.imageUrl;
  }

  // =====================================================
  // NORMALIZE URL
  // =====================================================
  private normalizeUrl(
    url?: string | null
  ): string | null {

    if (!url) return null;

    if (url.startsWith('http')) {

      return url;
    }

    return `${this.uploadsUrl.replace(
      /\/+$/,
      ''
    )}/${url.replace(
      /^\/+|uploads\/?/g,
      ''
    )}`;
  }
}
