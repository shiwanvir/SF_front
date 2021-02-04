import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyWiseComponent } from './monthly-wise.component';

describe('MonthlyWiseComponent', () => {
  let component: MonthlyWiseComponent;
  let fixture: ComponentFixture<MonthlyWiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthlyWiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
