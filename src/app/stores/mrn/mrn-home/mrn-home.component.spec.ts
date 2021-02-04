import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MrnHomeComponent } from './mrn-home.component';

describe('MrnHomeComponent', () => {
  let component: MrnHomeComponent;
  let fixture: ComponentFixture<MrnHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MrnHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MrnHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
