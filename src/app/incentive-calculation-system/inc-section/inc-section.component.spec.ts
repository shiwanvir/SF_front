import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncSectionComponent } from './inc-section.component';

describe('IncSectionComponent', () => {
  let component: IncSectionComponent;
  let fixture: ComponentFixture<IncSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
