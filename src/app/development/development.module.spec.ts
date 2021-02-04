import { DevelopmentModule } from './development.module';

describe('DevelopmentModule', () => {
  let developmentModule: DevelopmentModule;

  beforeEach(() => {
    developmentModule = new DevelopmentModule();
  });

  it('should create an instance', () => {
    expect(developmentModule).toBeTruthy();
  });
});
