import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrnModalComponent } from './grn-modal.component';

describe('GrnModalComponent', () => {
  let component: GrnModalComponent;
  let fixture: ComponentFixture<GrnModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrnModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
