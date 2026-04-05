const Simulation = require('../src/simulation');
const Time = require('../src/time');

describe('Simulation', () => {
  describe('time', () => {
    it('should start at 9am', () => {
      const sim = new Simulation();
      expect(sim.currentTime.hour()).toEqual(9);
      expect(sim.currentTime.minute()).toEqual(0);
    });

    it('should advance time by 1 minute when tick() is called', () => {
      const sim = new Simulation();
      sim.tick();
      expect(sim.currentTime.hour()).toEqual(9);
      expect(sim.currentTime.minute()).toEqual(1);
    });

    it('should advance multiple ticks', () => {
      const sim = new Simulation();
      sim.tick();
      sim.tick();
      sim.tick();
      expect(sim.currentTime.minute()).toEqual(3);
    });
  });

  describe('workday', () => {
    it('should be an active workday at 9am', () => {
      const sim = new Simulation();
      expect(sim.isActiveWorkday()).toEqual(true);
    });

    it('should not be an active workday at 5pm', () => {
      const sim = new Simulation();
      // advance to 5pm (8 hours * 60 minutes = 480 minutes)
      for (let i = 0; i < 480; i++) {
        sim.tick();
      }
      expect(sim.isActiveWorkday()).toEqual(false);
    });
  });
});
