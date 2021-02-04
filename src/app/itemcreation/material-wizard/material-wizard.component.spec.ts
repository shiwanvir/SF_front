import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialWizardComponent } from './material-wizard.component';

describe('MaterialWizardComponent', () => {
  let component: MaterialWizardComponent;
  let fixture: ComponentFixture<MaterialWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
