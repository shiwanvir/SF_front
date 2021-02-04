import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GarmentOperationComponentComponent } from './garment-operation-component.component';

describe('GarmentOperationComponentComponent', () => {
  let component: GarmentOperationComponentComponent;
  let fixture: ComponentFixture<GarmentOperationComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GarmentOperationComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GarmentOperationComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
