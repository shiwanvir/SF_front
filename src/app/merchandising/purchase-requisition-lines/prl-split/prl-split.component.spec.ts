import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrlSplitComponent } from './prl-split.component';

describe('PrlSplitComponent', () => {
  let component: PrlSplitComponent;
  let fixture: ComponentFixture<PrlSplitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrlSplitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrlSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
