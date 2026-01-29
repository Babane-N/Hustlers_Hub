import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationInfoModelComponent } from './verification-info-modal.component';

describe('VerificationInfoModelComponent', () => {
  let component: VerificationInfoModelComponent;
  let fixture: ComponentFixture<VerificationInfoModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerificationInfoModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificationInfoModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
