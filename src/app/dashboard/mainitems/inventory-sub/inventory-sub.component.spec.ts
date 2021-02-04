import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySubComponent } from './inventory-sub.component';

describe('InventorySubComponent', () => {
  let component: InventorySubComponent;
  let fixture: ComponentFixture<InventorySubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventorySubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorySubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
