import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncOrderTypeComponent } from './inc-order-type.component';

describe('IncOrderTypeComponent', () => {
  let component: IncOrderTypeComponent;
  let fixture: ComponentFixture<IncOrderTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncOrderTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncOrderTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
