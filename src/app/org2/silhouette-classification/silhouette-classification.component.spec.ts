import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SilhouetteClassificationComponent } from './silhouette-classification.component';

describe('SilhouetteClassificationComponent', () => {
  let component: SilhouetteClassificationComponent;
  let fixture: ComponentFixture<SilhouetteClassificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SilhouetteClassificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SilhouetteClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
