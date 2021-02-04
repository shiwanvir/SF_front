import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksubComponent } from './tasksub.component';

describe('TasksubComponent', () => {
  let component: TasksubComponent;
  let fixture: ComponentFixture<TasksubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
