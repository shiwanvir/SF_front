import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmvToolBoxDetailsComponent } from './smv-tool-box-details.component';

describe('SmvToolBoxDetailsComponent', () => {
  let component: SmvToolBoxDetailsComponent;
  let fixture: ComponentFixture<SmvToolBoxDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmvToolBoxDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmvToolBoxDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
