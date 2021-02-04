import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineTypeComponent } from './machine-type.component';

describe('MachineTypeComponent', () => {
  let component: MachineTypeComponent;
  let fixture: ComponentFixture<MachineTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
