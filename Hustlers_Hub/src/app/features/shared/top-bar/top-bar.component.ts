import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  isLoggedIn = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('authToken');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}

