import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SilhouetteComponent } from './silhouette.component';

describe('SilhouetteComponent', () => {
  let component: SilhouetteComponent;
  let fixture: ComponentFixture<SilhouetteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SilhouetteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SilhouetteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
