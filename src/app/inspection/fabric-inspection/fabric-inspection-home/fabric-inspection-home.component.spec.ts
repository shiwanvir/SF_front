import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricInspectionHomeComponent } from './fabric-inspection-home.component';

describe('FabricInspectionHomeComponent', () => {
  let component: FabricInspectionHomeComponent;
  let fixture: ComponentFixture<FabricInspectionHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabricInspectionHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricInspectionHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
