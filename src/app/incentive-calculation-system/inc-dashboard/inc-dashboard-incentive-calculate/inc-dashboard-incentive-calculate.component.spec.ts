import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncDashboardIncentiveCalculateComponent } from './inc-dashboard-incentive-calculate.component';

describe('IncDashboardIncentiveCalculateComponent', () => {
  let component: IncDashboardIncentiveCalculateComponent;
  let fixture: ComponentFixture<IncDashboardIncentiveCalculateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncDashboardIncentiveCalculateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncDashboardIncentiveCalculateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
