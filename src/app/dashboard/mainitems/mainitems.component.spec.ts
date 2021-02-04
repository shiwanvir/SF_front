import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainitemsComponent } from './mainitems.component';

describe('MainitemsComponent', () => {
  let component: MainitemsComponent;
  let fixture: ComponentFixture<MainitemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainitemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
