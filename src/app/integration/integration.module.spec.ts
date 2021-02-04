import { IntegrationModule } from './integration.module';

describe('IntegrationModule', () => {
  let integrationModule: IntegrationModule;

  beforeEach(() => {
    integrationModule = new IntegrationModule();
  });

  it('should create an instance', () => {
    expect(integrationModule).toBeTruthy();
  });
});
