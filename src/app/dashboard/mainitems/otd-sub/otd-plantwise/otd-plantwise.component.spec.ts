import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtdPlantwiseComponent } from './otd-plantwise.component';

describe('OtdPlantwiseComponent', () => {
  let component: OtdPlantwiseComponent;
  let fixture: ComponentFixture<OtdPlantwiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtdPlantwiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtdPlantwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
