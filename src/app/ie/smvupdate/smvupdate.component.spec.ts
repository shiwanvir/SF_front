import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmvupdateComponent } from './smvupdate.component';

describe('SmvupdateComponent', () => {
  let component: SmvupdateComponent;
  let fixture: ComponentFixture<SmvupdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmvupdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmvupdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
