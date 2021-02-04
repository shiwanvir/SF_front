import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncDashboardComponent } from './inc-dashboard.component';

describe('IncDashboardComponent', () => {
  let component: IncDashboardComponent;
  let fixture: ComponentFixture<IncDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
