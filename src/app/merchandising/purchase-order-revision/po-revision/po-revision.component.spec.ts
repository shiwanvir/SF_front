import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoRevisionComponent } from './po-revision.component';

describe('PoRevisionComponent', () => {
  let component: PoRevisionComponent;
  let fixture: ComponentFixture<PoRevisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoRevisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoRevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
