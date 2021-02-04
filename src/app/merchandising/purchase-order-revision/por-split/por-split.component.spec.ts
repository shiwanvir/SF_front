import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PorSplitComponent } from './por-split.component';

describe('PorSplitComponent', () => {
  let component: PorSplitComponent;
  let fixture: ComponentFixture<PorSplitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PorSplitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PorSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
