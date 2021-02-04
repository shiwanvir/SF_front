import { IncentiveCalculationSystemModule } from './incentive-calculation-system.module';

describe('IncentiveCalculationSystemModule', () => {
  let incentiveCalculationSystemModule: IncentiveCalculationSystemModule;

  beforeEach(() => {
    incentiveCalculationSystemModule = new IncentiveCalculationSystemModule();
  });

  it('should create an instance', () => {
    expect(incentiveCalculationSystemModule).toBeTruthy();
  });
});
