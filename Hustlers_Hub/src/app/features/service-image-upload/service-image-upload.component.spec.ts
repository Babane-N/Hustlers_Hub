import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceImageUploadComponent } from './service-image-upload.component';

describe('ServiceImageUploadComponent', () => {
  let component: ServiceImageUploadComponent;
  let fixture: ComponentFixture<ServiceImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceImageUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
