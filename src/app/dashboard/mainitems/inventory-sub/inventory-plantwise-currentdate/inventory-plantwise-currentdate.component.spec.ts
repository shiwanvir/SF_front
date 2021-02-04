import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryPlantwiseCurrentdateComponent } from './inventory-plantwise-currentdate.component';

describe('InventoryPlantwiseCurrentdateComponent', () => {
  let component: InventoryPlantwiseCurrentdateComponent;
  let fixture: ComponentFixture<InventoryPlantwiseCurrentdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryPlantwiseCurrentdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryPlantwiseCurrentdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
