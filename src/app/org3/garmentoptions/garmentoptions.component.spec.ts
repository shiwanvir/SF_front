import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GarmentoptionsComponent } from './garmentoptions.component';

describe('GarmentoptionsComponent', () => {
  let component: GarmentoptionsComponent;
  let fixture: ComponentFixture<GarmentoptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GarmentoptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GarmentoptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
