import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.Service'; // Adjust path if needed

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  userRole: string = 'customer'; // Default role
  isOpened: boolean = true;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userRole = user?.role || 'customer';
      } catch {
        this.userRole = 'customer';
      }
    } else {
      // Ensure guest still sees customer sidebar
      this.userRole = 'customer';
    }
  }

  toggleSidebar(): void {
    this.isOpened = !this.isOpened;
  }
}
