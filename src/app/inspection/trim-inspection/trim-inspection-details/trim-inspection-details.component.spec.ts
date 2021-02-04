import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrimInspectionDetailsComponent } from './trim-inspection-details.component';

describe('TrimInspectionDetailsComponent', () => {
  let component: TrimInspectionDetailsComponent;
  let fixture: ComponentFixture<TrimInspectionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrimInspectionDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrimInspectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
