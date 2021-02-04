import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryPlantwiseCurrentComponent } from './inventory-plantwise-current.component';

describe('InventoryPlantwiseCurrentComponent', () => {
  let component: InventoryPlantwiseCurrentComponent;
  let fixture: ComponentFixture<InventoryPlantwiseCurrentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryPlantwiseCurrentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryPlantwiseCurrentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
