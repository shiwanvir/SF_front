import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierTolaranceComponent } from './supplier-tolarance.component';

describe('SupplierTolaranceComponent', () => {
  let component: SupplierTolaranceComponent;
  let fixture: ComponentFixture<SupplierTolaranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierTolaranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierTolaranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
