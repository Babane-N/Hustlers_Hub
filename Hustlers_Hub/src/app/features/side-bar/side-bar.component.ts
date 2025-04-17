import { Component } from '@angular/core';

type MenuKey = 'dashboard' | 'settings';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  isOpened = true;
  submenu: Record<MenuKey, boolean> = {
    dashboard: false,
    settings: false
  };

  toggleSubmenu(menu: MenuKey) {
    this.submenu[menu] = !this.submenu[menu];
  }
}
