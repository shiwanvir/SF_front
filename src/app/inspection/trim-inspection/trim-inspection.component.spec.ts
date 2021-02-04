import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrimInspectionComponent } from './trim-inspection.component';

describe('TrimInspectionComponent', () => {
  let component: TrimInspectionComponent;
  let fixture: ComponentFixture<TrimInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrimInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrimInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
