import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtdPlantwiseInlastyearComponent } from './otd-plantwise-inlastyear.component';

describe('OtdPlantwiseInlastyearComponent', () => {
  let component: OtdPlantwiseInlastyearComponent;
  let fixture: ComponentFixture<OtdPlantwiseInlastyearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtdPlantwiseInlastyearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtdPlantwiseInlastyearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
