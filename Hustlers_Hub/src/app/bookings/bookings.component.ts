import { Component } from '@angular/core';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent {

  bookings = [
    {
      clientName: 'Lindiwe Nkosi',
      clientImage: 'https://randomuser.me/api/portraits/women/48.jpg',
      service: 'Hair Stylist',
      date: new Date(),
      location: 'Soweto, Johannesburg',
      details: 'Looking for a natural hair treatment and styling.'
    },
    {
      clientName: 'Thabo Radebe',
      clientImage: 'https://randomuser.me/api/portraits/men/22.jpg',
      service: 'Plumber',
      date: new Date('2025-04-22'),
      location: 'Pretoria North',
      details: 'Fixing leaking pipes and installing a new sink.'
    },
    {
      clientName: 'Naledi Mokoena',
      clientImage: 'https://randomuser.me/api/portraits/women/25.jpg',
      service: 'Fitness Trainer',
      date: new Date('2025-04-24'),
      location: 'Midrand',
      details: 'Morning fitness bootcamp session.'
    },
    {
      clientName: 'Kabelo Dlamini',
      clientImage: 'https://randomuser.me/api/portraits/men/11.jpg',
      service: 'Electrician',
      date: new Date('2025-04-25'),
      location: 'Sandton',
      details: 'Install new lights and fix the circuit breaker.'
    }
  ];

}
