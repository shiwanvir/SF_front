import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrlListComponent } from './prl-list.component';

describe('PrlListComponent', () => {
  let component: PrlListComponent;
  let fixture: ComponentFixture<PrlListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrlListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
