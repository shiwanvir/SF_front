import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemlistingComponent } from './itemlisting.component';

describe('ItemlistingComponent', () => {
  let component: ItemlistingComponent;
  let fixture: ComponentFixture<ItemlistingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemlistingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemlistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
