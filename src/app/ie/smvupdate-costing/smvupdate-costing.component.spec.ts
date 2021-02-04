import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmvupdateCostingComponent } from './smvupdate-costing.component';

describe('SmvupdateCostingComponent', () => {
  let component: SmvupdateCostingComponent;
  let fixture: ComponentFixture<SmvupdateCostingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmvupdateCostingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmvupdateCostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
