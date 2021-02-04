import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleCreationHomeComponent } from './style-creation-home.component';

describe('StyleCreationHomeComponent', () => {
  let component: StyleCreationHomeComponent;
  let fixture: ComponentFixture<StyleCreationHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleCreationHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleCreationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
