import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorNotAuthorizeComponent } from './error-not-authorize.component';

describe('ErrorNotAuthorizeComponent', () => {
  let component: ErrorNotAuthorizeComponent;
  let fixture: ComponentFixture<ErrorNotAuthorizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorNotAuthorizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorNotAuthorizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
