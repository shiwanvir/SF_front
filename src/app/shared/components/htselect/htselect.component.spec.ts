import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtselectComponent } from './htselect.component';

describe('HtselectComponent', () => {
  let component: HtselectComponent;
  let fixture: ComponentFixture<HtselectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtselectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
