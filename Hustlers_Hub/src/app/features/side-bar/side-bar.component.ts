import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Ensure lowercase 's'

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  isOpened = true;              // Desktop default
  isMobile = false;             // Mobile detection
  userRole: string | null = null;
  isLoggedIn = false;
  user: any = null;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.checkScreenSize();

    // Subscribe to auth state changes
    this.authService.role$.subscribe(role => {
      this.userRole = role;
    });

    this.authService.user$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
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

