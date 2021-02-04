import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedTaskComponent } from './rejected-task.component';

describe('RejectedTaskComponent', () => {
  let component: RejectedTaskComponent;
  let fixture: ComponentFixture<RejectedTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectedTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
