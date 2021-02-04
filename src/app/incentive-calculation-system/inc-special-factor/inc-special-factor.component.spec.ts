import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncSpecialFactorComponent } from './inc-special-factor.component';

describe('IncSpecialFactorComponent', () => {
  let component: IncSpecialFactorComponent;
  let fixture: ComponentFixture<IncSpecialFactorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncSpecialFactorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncSpecialFactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
