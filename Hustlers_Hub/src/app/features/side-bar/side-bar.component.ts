// side-bar.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  isHandset = false;
  userRole: string | null = null;

  constructor(private router: Router) { }

  toggleSidebar(): void {
    this.isHandset = !this.isHandset;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/home-page']);
  }
}
