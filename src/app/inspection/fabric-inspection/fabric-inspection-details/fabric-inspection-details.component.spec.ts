import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricInspectionDetailsComponent } from './fabric-inspection-details.component';

describe('FabricInspectionDetailsComponent', () => {
  let component: FabricInspectionDetailsComponent;
  let fixture: ComponentFixture<FabricInspectionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabricInspectionDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricInspectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
