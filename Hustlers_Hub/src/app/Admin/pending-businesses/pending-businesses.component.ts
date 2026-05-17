import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { PendingBusiness } from '../services/admin.service';

import {
  environment
} from '../../../environments/environment';

@Component({
  selector: 'app-pending-businesses',
  templateUrl: './pending-businesses.component.html',
  styleUrls: ['./pending-businesses.component.scss']
})
export class PendingBusinessesComponent implements OnInit {

  pendingBusinesses: PendingBusiness[] = [];

  loading = true;

  errorMsg = '';

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit(): void {

    this.loadPendingBusinesses();
  }

  // =====================================================
  // LOAD BUSINESSES
  // =====================================================
  loadPendingBusinesses() {

    this.adminService
      .getPendingBusinesses()
      .subscribe({

        next: businesses => {

          // Normalize logo URLs
          this.pendingBusinesses =
            businesses.map(business => ({

              ...business,

              logoUrl: this.normalizeUrl(
                business.logoUrl
              )
            }));

          this.loading = false;
        },

        error: () => {

          this.loading = false;

          this.errorMsg =
            'Failed to load pending businesses.';
        }
      });
  }

  // =====================================================
  // APPROVE BUSINESS
  // =====================================================
  approve(business: any) {

    const payload = {
      verifyBusiness:
        business.isVerified === true
    };

    this.adminService
      .approveBusiness(
        business.id,
        payload
      )
      .subscribe({

        next: () => {

          this.pendingBusinesses =
            this.pendingBusinesses.filter(
              b => b.id !== business.id
            );
        },

        error: (err) => {

          console.error(
            'Approve failed:',
            err.error || err
          );
        }
      });
  }

  // =====================================================
  // REJECT BUSINESS
  // =====================================================
  reject(businessId: string) {

    if (
      !confirm(
        '⚠️ Reject this business permanently?'
      )
    ) {
      return;
    }

    this.adminService
      .rejectBusiness(businessId)
      .subscribe({

        next: () => {

          this.pendingBusinesses =
            this.pendingBusinesses.filter(
              b => b.id !== businessId
            );
        },

        error: () => {

          alert(
            'Failed to reject business.'
          );
        }
      });
  }

  // =====================================================
  // NORMALIZE URL
  // =====================================================
  normalizeUrl(
    url?: string | null
  ): string | null {

    if (!url) {
      return null;
    }

    // Already absolute URL
    if (url.startsWith('http')) {
      return url;
    }

    return `${environment.uploadsUrl.replace(/\/+$/, '')}/${url.replace(/^\/+|uploads\/?/g, '')}`;
  }
}
