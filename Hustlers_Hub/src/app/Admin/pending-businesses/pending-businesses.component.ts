import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { PendingBusiness } from '../services/admin.service';

@Component({
  selector: 'app-pending-businesses',
  templateUrl: './pending-businesses.component.html',
  styleUrls: ['./pending-businesses.component.scss']
})
export class PendingBusinessesComponent implements OnInit {

  pendingBusinesses: PendingBusiness[] = [];
  loading = true;
  errorMsg = '';

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadPendingBusinesses();
  }

  loadPendingBusinesses() {
    this.adminService.getPendingBusinesses().subscribe({
      next: businesses => {
        this.pendingBusinesses = businesses;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to load pending businesses.';
      }
    });
  }

  approve(business: any) {
    this.adminService.approveBusiness(business.id, {
      verifyBusiness: business.verify === true
    }).subscribe(() => {
      this.pendingBusinesses =
        this.pendingBusinesses.filter(b => b.id !== business.id);
    });
  }



  reject(businessId: string) {
    if (!confirm('⚠️ Reject this business permanently?')) return;

    this.adminService.rejectBusiness(businessId).subscribe({
      next: () => {
        this.pendingBusinesses =
          this.pendingBusinesses.filter(b => b.id !== businessId);
      },
      error: () => alert('Failed to reject business.')
    });
  }
}
