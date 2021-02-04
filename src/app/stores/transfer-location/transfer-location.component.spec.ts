import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferLocationComponent } from './transfer-location.component';

describe('TransferLocationComponent', () => {
  let component: TransferLocationComponent;
  let fixture: ComponentFixture<TransferLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
