import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricInspectionComponent } from './fabric-inspection.component';

describe('FabricInspectionComponent', () => {
  let component: FabricInspectionComponent;
  let fixture: ComponentFixture<FabricInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabricInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
