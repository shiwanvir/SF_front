import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopOrderListComponent } from './shop-order-list.component';

describe('ShopOrderListComponent', () => {
  let component: ShopOrderListComponent;
  let fixture: ComponentFixture<ShopOrderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopOrderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
