import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderRevisionComponent } from './purchase-order-revision.component';

describe('PurchaseOrderRevisionComponent', () => {
  let component: PurchaseOrderRevisionComponent;
  let fixture: ComponentFixture<PurchaseOrderRevisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderRevisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderRevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
