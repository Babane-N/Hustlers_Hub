import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  business: any = {};
  bookings: any[] = [];       // Upcoming bookings from backend
  history: any[] = [];        // Past bookings
  reviews: any[] = [];        // Reviews
  isPremium = false;

  uploadsUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.loadBusinessDetails(userId);
    }
  }

  // Load business info
  loadBusinessDetails(userId: string) {
    this.http.get<any[]>(`${environment.apiUrl}/Businesses/Users/${userId}`).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.business = data[0];
          this.isPremium = this.business.isPremium || false;

          // Now load dashboard data
          this.loadBookings(this.business.businessId);
          this.loadHistory(this.business.businessId);
          this.loadReviews(this.business.businessId);
        }
      },
      error: (err) => console.error('Error fetching business:', err)
    });
  }

  // Load upcoming bookings
  loadBookings(businessId: string) {
    this.http.get<any[]>(`${environment.apiUrl}/Bookings/Business/${businessId}/Upcoming`).subscribe({
      next: (data) => this.bookings = data,
      error: (err) => console.error('Error fetching upcoming bookings:', err)
    });
  }

  // Load past bookings
  loadHistory(businessId: string) {
    this.http.get<any[]>(`${environment.apiUrl}/Bookings/Business/${businessId}/History`).subscribe({
      next: (data) => this.history = data,
      error: (err) => console.error('Error fetching booking history:', err)
    });
  }

  // Load reviews
  loadReviews(businessId: string) {
    this.http.get<any[]>(`${environment.apiUrl}/Reviews/Business/${businessId}`).subscribe({
      next: (data) => this.reviews = data,
      error: (err) => console.error('Error fetching reviews:', err)
    });
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  accessTool(toolName: string) {
    if (!this.isPremium) {
      alert(`The "${toolName}" tool is only available on Premium.`);
      return;
    }
    this.router.navigate([`/tools/${toolName.toLowerCase().replace(/ /g, '-')}`]);
  }
}
