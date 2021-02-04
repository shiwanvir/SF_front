import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterinLastTwoYearComponent } from './quarterin-last-two-year.component';

describe('QuarterinLastTwoYearComponent', () => {
  let component: QuarterinLastTwoYearComponent;
  let fixture: ComponentFixture<QuarterinLastTwoYearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuarterinLastTwoYearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterinLastTwoYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
