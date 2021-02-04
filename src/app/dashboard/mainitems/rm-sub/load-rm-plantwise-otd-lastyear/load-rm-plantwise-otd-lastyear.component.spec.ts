import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadRmPlantwiseOtdLastyearComponent } from './load-rm-plantwise-otd-lastyear.component';

describe('LoadRmPlantwiseOtdLastyearComponent', () => {
  let component: LoadRmPlantwiseOtdLastyearComponent;
  let fixture: ComponentFixture<LoadRmPlantwiseOtdLastyearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadRmPlantwiseOtdLastyearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadRmPlantwiseOtdLastyearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
