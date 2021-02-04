import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorysuboneComponent } from './inventorysubone.component';

describe('InventorysuboneComponent', () => {
  let component: InventorysuboneComponent;
  let fixture: ComponentFixture<InventorysuboneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventorysuboneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorysuboneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
