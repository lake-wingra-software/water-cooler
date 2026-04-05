const Simulation = require('../src/simulation');
const Person = require('../src/person');
const Time = require('../src/time');
const { defaultSchedule } = require('../src/schedules');

function ticksUntil(hour, minute) {
  return (hour * 60 + minute) - (9 * 60);
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
      const alice = new Person('Alice', defaultSchedule);
      const bob = new Person('Bob', defaultSchedule);

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

    it('people should not greet when moving to cubicles', () => {
      const alice = new Person('Alice', defaultSchedule);
      const bob = new Person('Bob', defaultSchedule);

      const sim = new Simulation();
      sim.addPerson(alice);
      sim.addPerson(bob);

      // Skip to just before 13:00
      for (let i = 0; i < ticksUntil(12, 59); i++) {
        sim.tick();
      }

      const messages = [];
      alice.on('messageReceived', (msg) => messages.push(msg));
      bob.on('messageReceived', (msg) => messages.push(msg));

      // Both transition to working at 13:00
      sim.tick();

      expect(messages.length).toEqual(0);
    });

    it('wally working all day should not receive messages from the water cooler', () => {
      const wallySchedule = [
        { startTime: new Time(9, 0), endTime: new Time(17, 0), activity: 'working' }
      ];
      const wally = new Person('Wally', wallySchedule);
      const alice = new Person('Alice', defaultSchedule);

      const sim = new Simulation();
      sim.addPerson(wally);
      sim.addPerson(alice);

      // Tick to just before water cooler time (15:29)
      for (let i = 0; i < ticksUntil(15, 29); i++) {
        sim.tick();
      }

      const wallyMessages = [];
      wally.on('messageReceived', (msg) => wallyMessages.push(msg));

      sim.tick();  // Alice arrives at water cooler at 15:30

      expect(wallyMessages.length).toEqual(0);
    });
  });
});
