import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from './auth.Service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isHandset = false;
  userRole: string | null = null;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => this.isHandset = result.matches);

    // ✅ Get user role (fetched from Azure-authenticated session or token)
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.userRole = user?.userType?.toString() || null;
      },
      error: () => {
        this.userRole = null;
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  closeIfMobile(drawer: any) {
    if (this.isHandset) drawer.close();
  }
}
