import { MerchandisingMasterModule } from './merchandising-master.module';

describe('MerchandisingMasterModule', () => {
  let merchandisingMasterModule: MerchandisingMasterModule;

  beforeEach(() => {
    merchandisingMasterModule = new MerchandisingMasterModule();
  });

  it('should create an instance', () => {
    expect(merchandisingMasterModule).toBeTruthy();
  });
});
