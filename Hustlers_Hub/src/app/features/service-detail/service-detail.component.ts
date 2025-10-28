import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  provider: any;
  reviews: any[] = [];
  uploadsUrl = environment.apiUrl;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/ServiceProviders/${id}`).subscribe({
        next: (data) => {
          this.provider = data;
          this.reviews = data.reviews || [];
        },
        error: (err) => console.error('Error loading service:', err)
      });
    }
  }

  openBookingDialog(providerId: string) {
    this.router.navigate(['/book', providerId]);
  }
}
