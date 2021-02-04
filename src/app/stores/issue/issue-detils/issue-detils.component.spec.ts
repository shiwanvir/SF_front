import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueDetilsComponent } from './issue-detils.component';

describe('IssueDetilsComponent', () => {
  let component: IssueDetilsComponent;
  let fixture: ComponentFixture<IssueDetilsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueDetilsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueDetilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
