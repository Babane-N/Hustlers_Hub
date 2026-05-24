import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../bookings/BookingService';
import { ActiveServiceContextService } from '../../core/active-service-context.service';

@Component({
  selector: 'app-booking-history',
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.scss']
})
export class BookingHistoryComponent implements OnInit {

  bookingHistory: any[] = [];
  filteredHistory: any[] = [];
  isLoading = false;

  searchTerm = '';
  selectedStatus = 'All';

  constructor(
    private bookingService: BookingService,
    private activeServiceContext: ActiveServiceContextService
  ) { }

  ngOnInit(): void {
    this.loadBookingHistory();
  }

  loadBookingHistory(): void {
    const businessId = this.activeServiceContext.getActiveBusinessId();

    if (!businessId) {
      console.error('No active business selected');
      return;
    }

    this.isLoading = true;

    this.bookingService.getBookingHistory(businessId).subscribe({
      next: (response) => {
        this.bookingHistory = response;
        this.filteredHistory = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load booking history', error);
        this.isLoading = false;
      }
    });
  }

  filterHistory(): void {
    let filtered = [...this.bookingHistory];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();

      filtered = filtered.filter(item =>
        item.customerName?.toLowerCase().includes(term) ||
        item.serviceName?.toLowerCase().includes(term) ||
        item.customerEmail?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(item => item.status === this.selectedStatus);
    }

    this.filteredHistory = filtered;
  }
}

