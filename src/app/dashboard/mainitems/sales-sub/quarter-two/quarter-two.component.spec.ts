import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterTwoComponent } from './quarter-two.component';

describe('QuarterTwoComponent', () => {
  let component: QuarterTwoComponent;
  let fixture: ComponentFixture<QuarterTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuarterTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
