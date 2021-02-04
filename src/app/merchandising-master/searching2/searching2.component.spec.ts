import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Searching2Component } from './searching2.component';

describe('Searching2Component', () => {
  let component: Searching2Component;
  let fixture: ComponentFixture<Searching2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Searching2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Searching2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
