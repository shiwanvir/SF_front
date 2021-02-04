import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryagingComponent } from './inventoryaging.component';

describe('InventoryagingComponent', () => {
  let component: InventoryagingComponent;
  let fixture: ComponentFixture<InventoryagingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryagingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
