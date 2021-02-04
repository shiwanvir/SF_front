import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarnsactionComponent } from './tarnsaction.component';

describe('TarnsactionComponent', () => {
  let component: TarnsactionComponent;
  let fixture: ComponentFixture<TarnsactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarnsactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarnsactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
