import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionSummeryLogComponent } from './inspection-summery-log.component';

describe('InspectionSummeryLogComponent', () => {
  let component: InspectionSummeryLogComponent;
  let fixture: ComponentFixture<InspectionSummeryLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InspectionSummeryLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectionSummeryLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
