import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorebinComponent } from './storebin.component';

describe('StorebinComponent', () => {
  let component: StorebinComponent;
  let fixture: ComponentFixture<StorebinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorebinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorebinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
