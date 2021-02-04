import { Org2Module } from './org2.module';

describe('Org2Module', () => {
  let org2Module: Org2Module;

  beforeEach(() => {
    org2Module = new Org2Module();
  });

  it('should create an instance', () => {
    expect(org2Module).toBeTruthy();
  });
});
