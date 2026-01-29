import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-business-fee-modal',
  templateUrl: './business-fee-modal.component.html',
  styleUrls: ['./business-fee-modal.component.scss']
})
export class BusinessFeeModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() learnMore = new EventEmitter<void>();

  continue() {
    localStorage.setItem('seenBusinessAdminFeeInfo', 'true');
    this.close.emit();
  }

  openLearnMore() {
    this.learnMore.emit();
  }
}
