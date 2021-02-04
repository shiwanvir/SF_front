import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrimInspectionHomeComponent } from './trim-inspection-home.component';

describe('TrimInspectionHomeComponent', () => {
  let component: TrimInspectionHomeComponent;
  let fixture: ComponentFixture<TrimInspectionHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrimInspectionHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrimInspectionHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
