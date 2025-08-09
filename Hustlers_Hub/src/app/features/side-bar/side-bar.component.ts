// side-bar.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  isOpened = true;
  userRole = localStorage.getItem('userRole');
  isLoggedIn = !!localStorage.getItem('authToken');

  constructor(private router: Router) { }

  toggleSidebar(): void {
    this.isOpened = !this.isOpened;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/home-page']);
  }
}
