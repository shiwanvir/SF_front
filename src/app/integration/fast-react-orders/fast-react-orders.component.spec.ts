import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FastReactOrdersComponent } from './fast-react-orders.component';

describe('FastReactOrdersComponent', () => {
  let component: FastReactOrdersComponent;
  let fixture: ComponentFixture<FastReactOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FastReactOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FastReactOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
