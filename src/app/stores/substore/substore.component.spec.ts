import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubstoreComponent } from './substore.component';

describe('SubstoreComponent', () => {
  let component: SubstoreComponent;
  let fixture: ComponentFixture<SubstoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubstoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubstoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
