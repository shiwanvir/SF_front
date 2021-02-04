import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueHomeComponent } from './issue-home.component';

describe('IssueHomeComponent', () => {
  let component: IssueHomeComponent;
  let fixture: ComponentFixture<IssueHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
