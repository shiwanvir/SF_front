import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterialTransferInListComponent } from './meterial-transfer-in-list.component';

describe('MeterialTransferInListComponent', () => {
  let component: MeterialTransferInListComponent;
  let fixture: ComponentFixture<MeterialTransferInListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeterialTransferInListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeterialTransferInListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
