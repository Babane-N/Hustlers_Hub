import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.Service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  isHandset = false;
  isOpened = true;
  userRole: string | null = null;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    // ✅ Detect handset layout
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isHandset = result.matches;
      if (this.isHandset) {
        this.isOpened = false;
      }
    });

    // ✅ Fetch user role from Azure API (instead of localStorage)
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.userRole = profile.userType;
        this.isLoggedIn = true;
      },
      error: () => {
        this.isLoggedIn = false;
      }
    });
  }

  toggleSidebar(): void {
    this.isOpened = !this.isOpened;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home-page']);
  }

  navigateTo(path: string): void {
    if (this.isHandset) this.isOpened = false;
    this.router.navigate([path]);
  }
}
