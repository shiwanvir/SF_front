import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialSizeComponent } from './material-size.component';

describe('MaterialSizeComponent', () => {
  let component: MaterialSizeComponent;
  let fixture: ComponentFixture<MaterialSizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialSizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
