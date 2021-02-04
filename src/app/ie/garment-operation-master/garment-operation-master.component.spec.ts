import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GarmentOperationMasterComponent } from './garment-operation-master.component';

describe('GarmentOperationMasterComponent', () => {
  let component: GarmentOperationMasterComponent;
  let fixture: ComponentFixture<GarmentOperationMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GarmentOperationMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GarmentOperationMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
