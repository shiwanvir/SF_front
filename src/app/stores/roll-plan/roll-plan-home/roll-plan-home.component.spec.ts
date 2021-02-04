import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollPlanHomeComponent } from './roll-plan-home.component';

describe('RollPlanHomeComponent', () => {
  let component: RollPlanHomeComponent;
  let fixture: ComponentFixture<RollPlanHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollPlanHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollPlanHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
