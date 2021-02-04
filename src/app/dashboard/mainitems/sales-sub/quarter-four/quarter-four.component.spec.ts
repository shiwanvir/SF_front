import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterFourComponent } from './quarter-four.component';

describe('QuarterFourComponent', () => {
  let component: QuarterFourComponent;
  let fixture: ComponentFixture<QuarterFourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuarterFourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterFourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
