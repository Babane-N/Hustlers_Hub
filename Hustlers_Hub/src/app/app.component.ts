import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'Hustlers_Hub';

  ngOnInit(): void {
    let userData = localStorage.getItem('user');
    if (!userData) {
      // Set default to customer if not signed in
      localStorage.setItem('user', JSON.stringify({ role: 'customer' }));
    }
  }


}
