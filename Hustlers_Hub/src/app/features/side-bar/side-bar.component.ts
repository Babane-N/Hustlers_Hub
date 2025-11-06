import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.Service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  isOpened = true;               // Desktop default
  isMobile = false;              // Mobile detection
  userRole: string | null = null;
  isLoggedIn = false;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.checkScreenSize();

    // Optional: subscribe to login state changes
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.userRole = this.authService.getRole();
    });
  }

  // Detect screen resize
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    this.isOpened = !this.isMobile;
  }

  // Toggle sidebar manually
  toggleSidebar(): void {
    this.isOpened = !this.isOpened;
  }

  // Navigate helper
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home-page']);
  }
}
