import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessFeeModelComponent } from './business-fee-modal.component';

describe('BusinessFeeModelComponent', () => {
  let component: BusinessFeeModelComponent;
  let fixture: ComponentFixture<BusinessFeeModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusinessFeeModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessFeeModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
