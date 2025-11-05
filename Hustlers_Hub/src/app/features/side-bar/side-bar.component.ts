import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from './auth.Service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
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
