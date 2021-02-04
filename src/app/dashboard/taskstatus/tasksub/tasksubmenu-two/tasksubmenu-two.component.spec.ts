import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksubmenuTwoComponent } from './tasksubmenu-two.component';

describe('TasksubmenuTwoComponent', () => {
  let component: TasksubmenuTwoComponent;
  let fixture: ComponentFixture<TasksubmenuTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksubmenuTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksubmenuTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
