import { D2dModule } from './d2d.module';

describe('D2dModule', () => {
  let d2dModule: D2dModule;

  beforeEach(() => {
    d2dModule = new D2dModule();
  });

  it('should create an instance', () => {
    expect(d2dModule).toBeTruthy();
  });
});
