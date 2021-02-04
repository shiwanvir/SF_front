import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmvToolBoxComponent } from './smv-tool-box.component';

describe('SmvToolBoxComponent', () => {
  let component: SmvToolBoxComponent;
  let fixture: ComponentFixture<SmvToolBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmvToolBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmvToolBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
