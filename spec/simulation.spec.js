const Simulation = require('../src/simulation');

describe('Simulation', () => {
  it('should exist', () => {
    expect(Simulation).toBeDefined();
  });

  // Add your behavioral specs here
  describe('initialization', () => {
    it('should create a new simulation', () => {
      const sim = new Simulation();
      expect(sim).toBeDefined();
    });
  });
});
