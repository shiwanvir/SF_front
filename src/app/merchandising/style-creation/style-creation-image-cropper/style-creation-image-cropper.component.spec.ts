import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleCreationImageCropperComponent } from './style-creation-image-cropper.component';

describe('StyleCreationImageCropperComponent', () => {
  let component: StyleCreationImageCropperComponent;
  let fixture: ComponentFixture<StyleCreationImageCropperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleCreationImageCropperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleCreationImageCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
