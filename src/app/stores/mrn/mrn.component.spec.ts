import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MrnComponent } from './mrn.component';

describe('MrnComponent', () => {
  let component: MrnComponent;
  let fixture: ComponentFixture<MrnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MrnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MrnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
