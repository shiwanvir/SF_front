import { Org3Module } from './org3.module';

describe('Org3Module', () => {
  let org3Module: Org3Module;

  beforeEach(() => {
    org3Module = new Org3Module();
  });

  it('should create an instance', () => {
    expect(org3Module).toBeTruthy();
  });
});
