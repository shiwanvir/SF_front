import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationSubComponentComponent } from './operation-sub-component.component';

describe('OperationSubComponentComponent', () => {
  let component: OperationSubComponentComponent;
  let fixture: ComponentFixture<OperationSubComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationSubComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationSubComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
