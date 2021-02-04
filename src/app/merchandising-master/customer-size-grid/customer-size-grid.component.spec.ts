import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSizeGridComponent } from './customer-size-grid.component';

describe('CustomerSizeGridComponent', () => {
  let component: CustomerSizeGridComponent;
  let fixture: ComponentFixture<CustomerSizeGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerSizeGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSizeGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
