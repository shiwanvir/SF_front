import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncLadderViewComponent } from './inc-ladder-view.component';

describe('IncLadderViewComponent', () => {
  let component: IncLadderViewComponent;
  let fixture: ComponentFixture<IncLadderViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncLadderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncLadderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
