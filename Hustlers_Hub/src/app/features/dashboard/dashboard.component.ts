import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  constructor(private router: Router) { }
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

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

}
