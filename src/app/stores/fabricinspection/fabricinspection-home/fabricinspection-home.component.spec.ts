import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricinspectionHomeComponent } from './fabricinspection-home.component';

describe('FabricinspectionHomeComponent', () => {
  let component: FabricinspectionHomeComponent;
  let fixture: ComponentFixture<FabricinspectionHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabricinspectionHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricinspectionHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
