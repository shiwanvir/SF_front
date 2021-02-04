import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentSmvDetailsComponent } from './component-smv-details.component';

describe('ComponentSmvDetailsComponent', () => {
  let component: ComponentSmvDetailsComponent;
  let fixture: ComponentFixture<ComponentSmvDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSmvDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSmvDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
