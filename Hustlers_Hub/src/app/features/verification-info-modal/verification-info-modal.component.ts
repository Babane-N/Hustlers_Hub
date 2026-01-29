import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-verification-info-modal',
  templateUrl: './verification-info-modal.component.html',
  styleUrls: ['./verification-info-modal.component.scss']
})
export class VerificationInfoModalComponent {
  @Output() close = new EventEmitter<void>();
}
