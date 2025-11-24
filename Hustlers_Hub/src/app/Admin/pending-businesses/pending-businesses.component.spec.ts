import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingBusinessesComponent } from './pending-businesses.component';

describe('PendingBusinessesComponent', () => {
  let component: PendingBusinessesComponent;
  let fixture: ComponentFixture<PendingBusinessesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingBusinessesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingBusinessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
