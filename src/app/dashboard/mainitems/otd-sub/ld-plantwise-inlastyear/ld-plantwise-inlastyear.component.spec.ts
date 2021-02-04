import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdPlantwiseInlastyearComponent } from './ld-plantwise-inlastyear.component';

describe('LdPlantwiseInlastyearComponent', () => {
  let component: LdPlantwiseInlastyearComponent;
  let fixture: ComponentFixture<LdPlantwiseInlastyearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LdPlantwiseInlastyearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdPlantwiseInlastyearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
