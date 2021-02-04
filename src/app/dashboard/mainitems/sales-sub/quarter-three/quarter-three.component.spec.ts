import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterThreeComponent } from './quarter-three.component';

describe('QuarterThreeComponent', () => {
  let component: QuarterThreeComponent;
  let fixture: ComponentFixture<QuarterThreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuarterThreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
