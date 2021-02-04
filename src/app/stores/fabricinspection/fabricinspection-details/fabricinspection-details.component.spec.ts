import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricinspectionDetailsComponent } from './fabricinspection-details.component';

describe('FabricinspectionDetailsComponent', () => {
  let component: FabricinspectionDetailsComponent;
  let fixture: ComponentFixture<FabricinspectionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabricinspectionDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricinspectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
