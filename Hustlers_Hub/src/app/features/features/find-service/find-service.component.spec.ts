import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindServiceComponent } from './find-service.component';

describe('FindServiceComponent', () => {
  let component: FindServiceComponent;
  let fixture: ComponentFixture<FindServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FindServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
