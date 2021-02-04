import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FastReactComponent } from './fast-react.component';

describe('FastReactComponent', () => {
  let component: FastReactComponent;
  let fixture: ComponentFixture<FastReactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FastReactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FastReactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
