import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  totalEarnings = 2450.75;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.http.get<any[]>(`https://localhost:7018/api/Businesses/Users/${userId}`).subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.business = data[0]; // Take first business for dashboard
          }
        },
        error: (err) => {
          console.error('Error fetching business:', err);
        }
      });
    }
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
