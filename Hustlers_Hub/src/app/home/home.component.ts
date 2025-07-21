import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Business {
  id: string;
  businessName: string;
  category: string;
  description: string;
  location: string;
  userId: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentBusiness?: Business;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const businessData = localStorage.getItem('activeBusinessData');
    if (businessData) {
      this.currentBusiness = JSON.parse(businessData);
    }
  }

  goToFindServices() {
    this.router.navigate(['/find-service']);
  }
}
