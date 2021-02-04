import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncDashboardHomeComponent } from './inc-dashboard-home.component';

describe('IncDashboardHomeComponent', () => {
  let component: IncDashboardHomeComponent;
  let fixture: ComponentFixture<IncDashboardHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncDashboardHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncDashboardHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
