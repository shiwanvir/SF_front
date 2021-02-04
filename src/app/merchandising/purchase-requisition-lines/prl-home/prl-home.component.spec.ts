import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrlHomeComponent } from './prl-home.component';

describe('PrlHomeComponent', () => {
  let component: PrlHomeComponent;
  let fixture: ComponentFixture<PrlHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrlHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrlHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
