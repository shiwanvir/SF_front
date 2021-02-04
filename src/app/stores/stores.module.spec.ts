import { StoresModule } from './stores.module';

describe('StoresModule', () => {
  let storesModule: StoresModule;

  beforeEach(() => {
    storesModule = new StoresModule();
  });

  it('should create an instance', () => {
    expect(storesModule).toBeTruthy();
  });
});
