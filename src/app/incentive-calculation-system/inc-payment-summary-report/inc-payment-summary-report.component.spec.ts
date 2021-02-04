import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncPaymentSummaryReportComponent } from './inc-payment-summary-report.component';

describe('IncPaymentSummaryReportComponent', () => {
  let component: IncPaymentSummaryReportComponent;
  let fixture: ComponentFixture<IncPaymentSummaryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncPaymentSummaryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncPaymentSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
