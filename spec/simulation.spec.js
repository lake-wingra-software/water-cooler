const Simulation = require('../src/simulation');
const Person = require('../src/person');
const Time = require('../src/time');

function ticksUntil(hour, minute) {
  return (hour * 60 + minute) - (9 * 60);
}

function createDefaultSchedule() {
  return [
    { startTime: new Time(9, 0), endTime: new Time(12, 0), activity: 'working' },
    { startTime: new Time(12, 0), endTime: new Time(13, 0), activity: 'cafeteria' },
    { startTime: new Time(13, 0), endTime: new Time(15, 30), activity: 'working' },
    { startTime: new Time(15, 30), endTime: new Time(16, 30), activity: 'water cooler' },
    { startTime: new Time(16, 30), endTime: new Time(17, 0), activity: 'working' }
  ];
}

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

  describe('water cooler', () => {
    it('alice and bob should greet each other when both at the water cooler', () => {
      const alice = new Person('Alice', createDefaultSchedule());
      const bob = new Person('Bob', createDefaultSchedule());

      const sim = new Simulation();
      sim.addPerson(alice);
      sim.addPerson(bob);

      // tick to 15:29 (one minute before water cooler)
      for (let i = 0; i < ticksUntil(15, 29); i++) {
        sim.tick();
      }

      const aliceMessages = [];
      const bobMessages = [];
      alice.on('messageReceived', (msg) => aliceMessages.push(msg));
      bob.on('messageReceived', (msg) => bobMessages.push(msg));

      sim.tick();  // they arrive at water cooler at 15:30, greet each other

      expect(aliceMessages.length).toEqual(1);
      expect(aliceMessages[0].from).toEqual('Bob');
      expect(aliceMessages[0].message).toEqual('hi Alice');

      expect(bobMessages.length).toEqual(1);
      expect(bobMessages[0].from).toEqual('Alice');
      expect(bobMessages[0].message).toEqual('hi Bob');
    });
  });
});
