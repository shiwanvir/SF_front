import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeSelectorComponent } from './size-selector.component';

describe('SizeSelectorComponent', () => {
  let component: SizeSelectorComponent;
  let fixture: ComponentFixture<SizeSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SizeSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SizeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
