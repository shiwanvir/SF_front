import { TestBed, inject } from '@angular/core/testing';

import { ManualPoService } from './manual-po.service';

describe('ManualPoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManualPoService]
    });
  });

  it('should be created', inject([ManualPoService], (service: ManualPoService) => {
    expect(service).toBeTruthy();
  }));
});
