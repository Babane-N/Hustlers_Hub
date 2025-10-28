import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // ✅ import environment

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public environment = environment;
  business: any = {};
  bookings = [
    { clientName: 'Jane Doe', date: new Date('2025-04-20'), service: 'Plumbing' },
    { clientName: 'Lungi Khumalo', date: new Date('2025-04-23'), service: 'Electrician' }
  ];
  history = [
    { clientName: 'Sipho Ndlovu', date: new Date('2025-03-15') },
    { clientName: 'Anele Dube', date: new Date('2025-03-10') }
  ];
  reviews = [
    { reviewer: 'Jane Doe', rating: 5, comment: 'Fantastic service!' },
    { reviewer: 'Lungi Khumalo', rating: 4, comment: 'Very professional.' }
  ];

  isPremium = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');

    if (userId) {
      // ✅ Use environment.apiUrl for flexible backend configuration
      const url = `${environment.apiUrl}/Businesses/Users/${userId}`;

      this.http.get<any[]>(url).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.business = data[0];
            this.isPremium = this.business.isPremium || false;
          } else {
            console.warn('No business data found for user:', userId);
          }
        },
        error: (err) => {
          console.error('Error fetching business:', err);
        }
      });
    } else {
      console.warn('No userId found in localStorage.');
    }
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  accessTool(toolName: string) {
    if (!this.isPremium) {
      alert(`The "${toolName}" tool is only available on Premium.`);
      return;
    }

    const route = `/tools/${toolName.toLowerCase().replace(/ /g, '-')}`;
    this.router.navigate([route]);
  }
}
