import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service'; // ✅ Adjust path based on your structure

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  userRole: string = 'Customer'; // Default role
  isOpened: boolean = true;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.userRole = role ?? 'Customer';
  }

  toggleSidebar(): void {
    this.isOpened = !this.isOpened;
  }
}
