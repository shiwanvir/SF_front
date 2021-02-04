import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncIncentivePolicyComponent } from './inc-incentive-policy.component';

describe('IncIncentivePolicyComponent', () => {
  let component: IncIncentivePolicyComponent;
  let fixture: ComponentFixture<IncIncentivePolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncIncentivePolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncIncentivePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
