import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdCreatorComponent } from './ad-creator.component';

describe('AdCreatorComponent', () => {
  let component: AdCreatorComponent;
  let fixture: ComponentFixture<AdCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
