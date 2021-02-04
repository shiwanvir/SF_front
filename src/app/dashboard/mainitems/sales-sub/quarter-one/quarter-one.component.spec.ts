import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterOneComponent } from './quarter-one.component';

describe('QuarterOneComponent', () => {
  let component: QuarterOneComponent;
  let fixture: ComponentFixture<QuarterOneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuarterOneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
