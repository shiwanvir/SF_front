import { InspectionModule } from './inspection.module';

describe('InspectionModule', () => {
  let inspectionModule: InspectionModule;

  beforeEach(() => {
    inspectionModule = new InspectionModule();
  });

  it('should create an instance', () => {
    expect(inspectionModule).toBeTruthy();
  });
});
