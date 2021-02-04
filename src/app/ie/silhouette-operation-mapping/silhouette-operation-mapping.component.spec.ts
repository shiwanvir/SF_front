import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SilhouetteOperationMappingComponent } from './silhouette-operation-mapping.component';

describe('SilhouetteOperationMappingComponent', () => {
  let component: SilhouetteOperationMappingComponent;
  let fixture: ComponentFixture<SilhouetteOperationMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SilhouetteOperationMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SilhouetteOperationMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
