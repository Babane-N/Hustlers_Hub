import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessSwitcherComponent } from './business-switcher.component';

describe('BusinessSwitcherComponent', () => {
  let component: BusinessSwitcherComponent;
  let fixture: ComponentFixture<BusinessSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusinessSwitcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
