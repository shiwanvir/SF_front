import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialTransferInComponent } from './material-transfer-in.component';

describe('MaterialTransferInComponent', () => {
  let component: MaterialTransferInComponent;
  let fixture: ComponentFixture<MaterialTransferInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialTransferInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialTransferInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
