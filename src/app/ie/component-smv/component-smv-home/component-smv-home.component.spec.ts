import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentSmvHomeComponent } from './component-smv-home.component';

describe('ComponentSmvHomeComponent', () => {
  let component: ComponentSmvHomeComponent;
  let fixture: ComponentFixture<ComponentSmvHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSmvHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSmvHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
