import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginD2dIntimatesComponent } from './login-d2d-intimates.component';

describe('LoginD2dIntimatesComponent', () => {
  let component: LoginD2dIntimatesComponent;
  let fixture: ComponentFixture<LoginD2dIntimatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginD2dIntimatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginD2dIntimatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
