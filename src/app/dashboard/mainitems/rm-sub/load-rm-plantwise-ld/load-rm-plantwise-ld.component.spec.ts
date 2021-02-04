import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadRmPlantwiseLdComponent } from './load-rm-plantwise-ld.component';

describe('LoadRmPlantwiseLdComponent', () => {
  let component: LoadRmPlantwiseLdComponent;
  let fixture: ComponentFixture<LoadRmPlantwiseLdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadRmPlantwiseLdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadRmPlantwiseLdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
