import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadRmPlantwiseOtdTocurrentComponent } from './load-rm-plantwise-otd-tocurrent.component';

describe('LoadRmPlantwiseOtdTocurrentComponent', () => {
  let component: LoadRmPlantwiseOtdTocurrentComponent;
  let fixture: ComponentFixture<LoadRmPlantwiseOtdTocurrentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadRmPlantwiseOtdTocurrentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadRmPlantwiseOtdTocurrentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
