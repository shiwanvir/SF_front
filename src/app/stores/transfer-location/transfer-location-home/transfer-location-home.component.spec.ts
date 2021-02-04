import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferLocationHomeComponent } from './transfer-location-home.component';

describe('TransferLocationHomeComponent', () => {
  let component: TransferLocationHomeComponent;
  let fixture: ComponentFixture<TransferLocationHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferLocationHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferLocationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
