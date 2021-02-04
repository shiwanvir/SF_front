import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinConfigComponent } from './bin-config.component';

describe('BinConfigComponent', () => {
  let component: BinConfigComponent;
  let fixture: ComponentFixture<BinConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
