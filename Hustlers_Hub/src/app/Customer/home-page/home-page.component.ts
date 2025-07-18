import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  activeTab: 'services' | 'promotion' = 'services';

  switchTab(tab: 'services' | 'promotion'): void {
    this.activeTab = tab;
  }
}
