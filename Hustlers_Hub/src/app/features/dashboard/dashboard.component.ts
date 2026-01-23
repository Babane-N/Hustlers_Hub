import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  business: any = null; // ⚡ Now holds the active business
  uploadsUrl = environment.uploadsUrl || ''; // e.g., "https://yourdomain.com/uploads"

  bookings: any[] = [];
  history: any[] = [];
  reviews: any[] = [];

  isPremium = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Load user's first approved business
    this.http.get<any[]>(`${environment.apiUrl}/Businesses/Users/${user.id}`).subscribe({
      next: (res) => {
        // Pick the first approved business
        this.business = res.find(b => b.isApproved) || res[0] || null;
        if (!this.business) return;

        this.isPremium = this.business.isPremium ?? false;

        this.loadBookings();
        this.loadHistory();
        this.loadReviews();
      },
      error: (err) => console.error('Failed to load business', err)
    });
  }

  // ========================
  // DATA LOADERS
  // ========================

  loadBookings() {
    if (!this.business) return;

    this.http
      .get<any[]>(`${environment.apiUrl}/Bookings/business/${this.business.id}`)
      .subscribe({
        next: data => this.bookings = data.filter(b => b.status === 'Pending'),
        error: err => console.error('Failed to load bookings', err)
      });
  }

  loadHistory() {
    if (!this.business) return;

    this.http
      .get<any[]>(`${environment.apiUrl}/Bookings/business/${this.business.id}`)
      .subscribe({
        next: data => this.history = data.filter(b => b.status === 'Completed'),
        error: err => console.error('Failed to load history', err)
      });
  }

  loadReviews() {
    if (!this.business) return;

    this.http
      .get<any[]>(`${environment.apiUrl}/Reviews/business/${this.business.id}`)
      .subscribe({
        next: data => this.reviews = data,
        error: err => console.error('Failed to load reviews', err)
      });
  }

  // ========================
  // NAVIGATION
  // ========================
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
