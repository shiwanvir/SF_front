import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MrnTestComponent } from './mrn-test.component';

describe('MrnTestComponent', () => {
  let component: MrnTestComponent;
  let fixture: ComponentFixture<MrnTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MrnTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MrnTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
