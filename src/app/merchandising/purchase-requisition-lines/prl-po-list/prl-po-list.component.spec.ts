import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrlPoListComponent } from './prl-po-list.component';

describe('PrlPoListComponent', () => {
  let component: PrlPoListComponent;
  let fixture: ComponentFixture<PrlPoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrlPoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrlPoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
