import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadRmPlantwiseLdTocurrentComponent } from './load-rm-plantwise-ld-tocurrent.component';

describe('LoadRmPlantwiseLdTocurrentComponent', () => {
  let component: LoadRmPlantwiseLdTocurrentComponent;
  let fixture: ComponentFixture<LoadRmPlantwiseLdTocurrentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadRmPlantwiseLdTocurrentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadRmPlantwiseLdTocurrentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
