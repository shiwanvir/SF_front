import { TestBed, inject } from '@angular/core/testing';

import { GrnServicesService } from './grn-services.service';

describe('GrnServicesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrnServicesService]
    });
  });

  it('should be created', inject([GrnServicesService], (service: GrnServicesService) => {
    expect(service).toBeTruthy();
  }));
});
