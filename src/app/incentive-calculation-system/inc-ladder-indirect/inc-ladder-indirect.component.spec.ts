import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncLadderIndirectComponent } from './inc-ladder-indirect.component';

describe('IncLadderIndirectComponent', () => {
  let component: IncLadderIndirectComponent;
  let fixture: ComponentFixture<IncLadderIndirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncLadderIndirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncLadderIndirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
