import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinTransferModalComponent } from './bin-transfer-modal.component';

describe('BinTransferModalComponent', () => {
  let component: BinTransferModalComponent;
  let fixture: ComponentFixture<BinTransferModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinTransferModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinTransferModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
