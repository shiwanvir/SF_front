import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtdPlantwiseUntilCurrentdatComponent } from './otd-plantwise-until-currentdat.component';

describe('OtdPlantwiseUntilCurrentdatComponent', () => {
  let component: OtdPlantwiseUntilCurrentdatComponent;
  let fixture: ComponentFixture<OtdPlantwiseUntilCurrentdatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtdPlantwiseUntilCurrentdatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtdPlantwiseUntilCurrentdatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
