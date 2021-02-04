import { MerchandisingModule } from './merchandising.module';

describe('MerchandisingModule', () => {
  let merchandisingModule: MerchandisingModule;

  beforeEach(() => {
    merchandisingModule = new MerchandisingModule();
  });

  it('should create an instance', () => {
    expect(merchandisingModule).toBeTruthy();
  });
});
