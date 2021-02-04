import { OrgModule } from './org.module';

describe('OrgModule', () => {
  let orgModule: OrgModule;

  beforeEach(() => {
    orgModule = new OrgModule();
  });

  it('should create an instance', () => {
    expect(orgModule).toBeTruthy();
  });
});
