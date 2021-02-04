import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricinspectionComponent } from './fabricinspection.component';

describe('FabricinspectionComponent', () => {
  let component: FabricinspectionComponent;
  let fixture: ComponentFixture<FabricinspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabricinspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricinspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
