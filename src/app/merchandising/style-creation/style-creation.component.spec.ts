import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleCreationComponent } from './style-creation.component';

describe('StyleCreationComponent', () => {
  let component: StyleCreationComponent;
  let fixture: ComponentFixture<StyleCreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
