// side-bar.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
<<<<<<< HEAD
  isHandset = false;
  userRole: string | null = null;
=======
  isOpened = true;
  userRole = localStorage.getItem('userRole');
  isLoggedIn = !!localStorage.getItem('authToken');
>>>>>>> parent of 334e381 (Sidebar Update)

  constructor(private router: Router) { }

  toggleSidebar(): void {
    this.isOpened = !this.isOpened;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/home-page']);
  }
}
