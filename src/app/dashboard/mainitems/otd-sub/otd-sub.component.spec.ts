import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtdSubComponent } from './otd-sub.component';

describe('OtdSubComponent', () => {
  let component: OtdSubComponent;
  let fixture: ComponentFixture<OtdSubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtdSubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtdSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
