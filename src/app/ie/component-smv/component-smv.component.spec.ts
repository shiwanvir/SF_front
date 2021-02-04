import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentSmvComponent } from './component-smv.component';

describe('ComponentSmvComponent', () => {
  let component: ComponentSmvComponent;
  let fixture: ComponentFixture<ComponentSmvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSmvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSmvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
