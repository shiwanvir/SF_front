import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncEquationComponent } from './inc-equation.component';

describe('IncEquationComponent', () => {
  let component: IncEquationComponent;
  let fixture: ComponentFixture<IncEquationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncEquationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncEquationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
