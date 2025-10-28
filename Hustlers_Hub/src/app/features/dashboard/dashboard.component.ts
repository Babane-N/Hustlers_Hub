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
  uploadsUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.http.get<any[]>(`${environment.apiUrl}/Businesses/Users/${userId}`).subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.business = data[0];
            this.isPremium = this.business.isPremium || false;
          }
        },
        error: (err) => console.error('Error fetching business:', err)
      });
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
    this.router.navigate([`/tools/${toolName.toLowerCase().replace(/ /g, '-')}`]);
  }
}
