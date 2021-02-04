import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentLdPlantwiseComponent } from './current-ld-plantwise.component';

describe('CurrentLdPlantwiseComponent', () => {
  let component: CurrentLdPlantwiseComponent;
  let fixture: ComponentFixture<CurrentLdPlantwiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentLdPlantwiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentLdPlantwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
