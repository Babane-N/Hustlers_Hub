import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  stats = {
    totalUsers: 0,
    totalBusinesses: 0,
    pending: 0,
    approved: 0,
    verified: 0,
    unverified: 0
  };

  loading = true;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goToPending() {
    this.router.navigate(['/admin/pending-businesses']);
  }

  goToReports() {
    this.router.navigate(['/admin/reports']);
  }
}
