import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferLocationDetailsComponent } from './transfer-location-details.component';

describe('TransferLocationDetailsComponent', () => {
  let component: TransferLocationDetailsComponent;
  let fixture: ComponentFixture<TransferLocationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferLocationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferLocationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
