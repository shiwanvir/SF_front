import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LengthAuditComponent } from './length-audit.component';

describe('LengthAuditComponent', () => {
  let component: LengthAuditComponent;
  let fixture: ComponentFixture<LengthAuditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LengthAuditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LengthAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
