import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadRmPlantwiseLdLastyearComponent } from './load-rm-plantwise-ld-lastyear.component';

describe('LoadRmPlantwiseLdLastyearComponent', () => {
  let component: LoadRmPlantwiseLdLastyearComponent;
  let fixture: ComponentFixture<LoadRmPlantwiseLdLastyearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadRmPlantwiseLdLastyearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadRmPlantwiseLdLastyearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
