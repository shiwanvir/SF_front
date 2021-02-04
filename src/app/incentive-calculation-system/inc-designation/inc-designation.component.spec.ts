import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncDesignationComponent } from './inc-designation.component';

describe('IncDesignationComponent', () => {
  let component: IncDesignationComponent;
  let fixture: ComponentFixture<IncDesignationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncDesignationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncDesignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
