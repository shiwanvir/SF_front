import { IeModule } from './ie.module';

describe('IeModule', () => {
  let ieModule: IeModule;

  beforeEach(() => {
    ieModule = new IeModule();
  });

  it('should create an instance', () => {
    expect(ieModule).toBeTruthy();
  });
});
