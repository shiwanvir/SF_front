import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RmSubComponent } from './rm-sub.component';

describe('RmSubComponent', () => {
  let component: RmSubComponent;
  let fixture: ComponentFixture<RmSubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RmSubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RmSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
