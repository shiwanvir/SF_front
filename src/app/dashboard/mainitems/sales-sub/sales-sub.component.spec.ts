import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesSubComponent } from './sales-sub.component';

describe('SalesSubComponent', () => {
  let component: SalesSubComponent;
  let fixture: ComponentFixture<SalesSubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesSubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
