import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncAqlComponent } from './inc-aql.component';

describe('IncAqlComponent', () => {
  let component: IncAqlComponent;
  let fixture: ComponentFixture<IncAqlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncAqlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncAqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
