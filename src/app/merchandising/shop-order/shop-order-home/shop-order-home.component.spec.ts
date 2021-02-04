import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopOrderHomeComponent } from './shop-order-home.component';

describe('ShopOrderHomeComponent', () => {
  let component: ShopOrderHomeComponent;
  let fixture: ComponentFixture<ShopOrderHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopOrderHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopOrderHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
