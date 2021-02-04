import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmvToolBoxHomeComponent } from './smv-tool-box-home.component';

describe('SmvToolBoxHomeComponent', () => {
  let component: SmvToolBoxHomeComponent;
  let fixture: ComponentFixture<SmvToolBoxHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmvToolBoxHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmvToolBoxHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
