import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncLadderComponent } from './inc-ladder.component';

describe('IncLadderComponent', () => {
  let component: IncLadderComponent;
  let fixture: ComponentFixture<IncLadderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncLadderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncLadderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
