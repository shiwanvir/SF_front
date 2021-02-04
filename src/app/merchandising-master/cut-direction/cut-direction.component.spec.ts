import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CutDirectionComponent } from './cut-direction.component';

describe('CutDirectionComponent', () => {
  let component: CutDirectionComponent;
  let fixture: ComponentFixture<CutDirectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CutDirectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CutDirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
