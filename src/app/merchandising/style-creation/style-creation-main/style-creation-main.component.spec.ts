import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleCreationMainComponent } from './style-creation-main.component';

describe('StyleCreationMainComponent', () => {
  let component: StyleCreationMainComponent;
  let fixture: ComponentFixture<StyleCreationMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleCreationMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleCreationMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
