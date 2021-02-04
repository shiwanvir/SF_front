import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleCreationPopupComponent } from './style-creation-popup.component';

describe('StyleCreationPopupComponent', () => {
  let component: StyleCreationPopupComponent;
  let fixture: ComponentFixture<StyleCreationPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleCreationPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleCreationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
