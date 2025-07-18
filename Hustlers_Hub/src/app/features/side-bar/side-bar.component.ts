import { Component } from '@angular/core';

type MenuKey = 'dashboard' | 'settings' | 'bookings' | 'promotion' | 'services' | 'business';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  isOpened = true;

  submenu: Record<MenuKey, boolean> = {
    dashboard: false,
    settings: false,
    bookings: false,
    promotion: false,
    services: false,
    business: false
  };

  toggleSubmenu(menu: MenuKey) {
    this.submenu[menu] = !this.submenu[menu];
  }

  toggleSidebar() {
    this.isOpened = !this.isOpened;
  }
}
