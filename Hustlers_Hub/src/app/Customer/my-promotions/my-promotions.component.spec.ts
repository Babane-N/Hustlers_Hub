import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPromotionsComponent } from './my-promotions.component';

describe('MyPromotionsComponent', () => {
  let component: MyPromotionsComponent;
  let fixture: ComponentFixture<MyPromotionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyPromotionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
