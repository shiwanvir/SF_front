import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollPlanDetailsComponent } from './roll-plan-details.component';

describe('RollPlanDetailsComponent', () => {
  let component: RollPlanDetailsComponent;
  let fixture: ComponentFixture<RollPlanDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollPlanDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
