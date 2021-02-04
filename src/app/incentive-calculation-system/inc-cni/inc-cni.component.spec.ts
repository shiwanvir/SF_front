import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncCniComponent } from './inc-cni.component';

describe('IncCniComponent', () => {
  let component: IncCniComponent;
  let fixture: ComponentFixture<IncCniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncCniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncCniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
