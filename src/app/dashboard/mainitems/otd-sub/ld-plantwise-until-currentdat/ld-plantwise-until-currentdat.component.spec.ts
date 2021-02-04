import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdPlantwiseUntilCurrentdatComponent } from './ld-plantwise-until-currentdat.component';

describe('LdPlantwiseUntilCurrentdatComponent', () => {
  let component: LdPlantwiseUntilCurrentdatComponent;
  let fixture: ComponentFixture<LdPlantwiseUntilCurrentdatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LdPlantwiseUntilCurrentdatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdPlantwiseUntilCurrentdatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
