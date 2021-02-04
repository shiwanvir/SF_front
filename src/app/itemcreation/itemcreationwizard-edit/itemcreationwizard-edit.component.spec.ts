import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemcreationwizardEditComponent } from './itemcreationwizard-edit.component';

describe('ItemcreationwizardEditComponent', () => {
  let component: ItemcreationwizardEditComponent;
  let fixture: ComponentFixture<ItemcreationwizardEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemcreationwizardEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemcreationwizardEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
