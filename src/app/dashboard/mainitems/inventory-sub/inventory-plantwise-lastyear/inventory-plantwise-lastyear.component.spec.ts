import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryPlantwiseLastyearComponent } from './inventory-plantwise-lastyear.component';

describe('InventoryPlantwiseLastyearComponent', () => {
  let component: InventoryPlantwiseLastyearComponent;
  let fixture: ComponentFixture<InventoryPlantwiseLastyearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryPlantwiseLastyearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryPlantwiseLastyearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
