import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncBufferPolicyComponent } from './inc-buffer-policy.component';

describe('IncBufferPolicyComponent', () => {
  let component: IncBufferPolicyComponent;
  let fixture: ComponentFixture<IncBufferPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncBufferPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncBufferPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
