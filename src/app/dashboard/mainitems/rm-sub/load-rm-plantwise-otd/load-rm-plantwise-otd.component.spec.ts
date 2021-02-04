import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadRmPlantwiseOtdComponent } from './load-rm-plantwise-otd.component';

describe('LoadRmPlantwiseOtdComponent', () => {
  let component: LoadRmPlantwiseOtdComponent;
  let fixture: ComponentFixture<LoadRmPlantwiseOtdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadRmPlantwiseOtdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadRmPlantwiseOtdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
