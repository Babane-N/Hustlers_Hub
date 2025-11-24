import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-pending-businesses',
  templateUrl: './pending-businesses.component.html',
  styleUrls: ['./pending-businesses.component.scss']
})
export class PendingBusinessesComponent implements OnInit {

  pendingBusinesses: any[] = [];
  loading = true;
  errorMsg = '';

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadPendingBusinesses();
  }

  loadPendingBusinesses() {
    this.adminService.getPendingBusinesses().subscribe({
      next: (response) => {
        this.pendingBusinesses = response;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to load pending businesses.';
      }
    });
  }

  approve(businessId: number) {
    this.adminService.approveBusiness(businessId).subscribe({
      next: () => {
        this.pendingBusinesses = this.pendingBusinesses.filter(b => b.id !== businessId);
      },
      error: () => {
        alert('Failed to approve business.');
      }
    });
  }

  reject(businessId: number) {
    const confirmReject = confirm("⚠️ Are you sure you want to reject this business?\nThis action cannot be undone.");

    if (!confirmReject) return;

    this.adminService.rejectBusiness(businessId).subscribe({
      next: () => {
        this.pendingBusinesses = this.pendingBusinesses.filter(b => b.id !== businessId);
      },
      error: () => {
        alert('Failed to decline business.');
      }
    });
  }
}
