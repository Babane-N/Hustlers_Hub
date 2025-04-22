import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss'
})
export class ServiceDetailComponent {
  provider: any;

  providers = [
    {
      name: 'Lebo Dlamini',
      service: 'Electrician',
      location: 'Johannesburg',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      description: 'Specialist in home wiring and appliance repairs.',
      reviews: [
        { user: 'Sipho', comment: 'Excellent service, quick and neat!', rating: 5 },
        { user: 'Noma', comment: 'Reliable and professional.', rating: 4 }
      ],
      gallery: [
        'https://source.unsplash.com/400x300/?electrician',
        'https://source.unsplash.com/400x300/?wiring',
        'https://source.unsplash.com/400x300/?tools'
      ]
    },
    {
      name: 'Thandi Mokoena',
      service: 'House Cleaner',
      location: 'Pretoria',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      description: 'Reliable and efficient cleaning for homes and offices.',
      reviews: [
        { user: 'John', comment: 'My place was sparkling clean!', rating: 5 }
      ],
      gallery: [
        'https://source.unsplash.com/400x300/?cleaning',
        'https://source.unsplash.com/400x300/?vacuum',
        'https://source.unsplash.com/400x300/?mop'
      ]
    },
    {
      name: 'Sbu Khumalo',
      service: 'Fitness Trainer',
      location: 'Durban',
      image: 'https://randomuser.me/api/portraits/men/55.jpg',
      description: 'Helping clients stay fit with custom workout plans.',
      reviews: [
        { user: 'Zanele', comment: 'Lost 5kg in 2 months. Thanks Coach!', rating: 5 },
        { user: 'Brian', comment: 'Motivating and great workouts!', rating: 4 }
      ],
      gallery: [
        'https://source.unsplash.com/400x300/?gym',
        'https://source.unsplash.com/400x300/?fitness',
        'https://source.unsplash.com/400x300/?personaltrainer'
      ]
    }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.provider = this.providers[id];
  }
}
