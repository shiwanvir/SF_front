import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFlashComponent } from './report-flash.component';

describe('ReportFlashComponent', () => {
  let component: ReportFlashComponent;
  let fixture: ComponentFixture<ReportFlashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportFlashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFlashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
