import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRequisitionLinesComponent } from './purchase-requisition-lines.component';

describe('PurchaseRequisitionLinesComponent', () => {
  let component: PurchaseRequisitionLinesComponent;
  let fixture: ComponentFixture<PurchaseRequisitionLinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseRequisitionLinesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRequisitionLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
