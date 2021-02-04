import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollPlanComponent } from './roll-plan.component';

describe('RollPlanComponent', () => {
  let component: RollPlanComponent;
  let fixture: ComponentFixture<RollPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
