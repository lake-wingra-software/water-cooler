const Simulation = require('../src/simulation');
const Person = require('../src/person');
const Time = require('../src/time');
const { defaultSchedule } = require('../src/schedules');
const greeter = require('../src/greeter');

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

  describe('events', () => {
    it('emits locationChanged when a person changes location', () => {
      const alice = new Person('Alice', defaultSchedule);
      const sim = new Simulation();
      sim.addPerson(alice);

      const events = [];
      sim.on('locationChanged', (data) => events.push(data));

      // Tick to 12:00 — Alice moves from cubicle to cafeteria
      for (let i = 0; i < ticksUntil(12, 0); i++) {
        sim.tick();
      }

      expect(events.length).toEqual(1);
      expect(events[0]).toEqual({ person: alice, from: 'cubicle', to: 'cafeteria' });
    });
  });

  describe('water cooler', () => {
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

    it('wally at his cubicle all day should not receive messages from the water cooler', () => {
      const wallySchedule = [
        { startTime: new Time(9, 0), endTime: new Time(17, 0), location: 'cubicle' }
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

    it('should only greet once — no more messages after the exchange', () => {
      const alice = new Person('Alice', defaultSchedule, greeter);
      const bob = new Person('Bob', defaultSchedule, greeter);

      const sim = new Simulation();
      sim.addPerson(alice);
      sim.addPerson(bob);

      for (let i = 0; i < ticksUntil(15, 29); i++) {
        sim.tick();
      }

      sim.tick();  // 15:30 — Alice greets Bob
      sim.tick();  // 15:31 — Bob responds
      sim.tick();  // 15:32 — nothing more to say

      expect(alice.chat.length).toEqual(2);
      expect(bob.chat.length).toEqual(2);
    });

    it('alice arriving at water cooler should initiate, bob should respond', () => {
      const alice = new Person('Alice', defaultSchedule, greeter);
      const bob = new Person('Bob', defaultSchedule, greeter);

      const sim = new Simulation();
      sim.addPerson(alice);
      sim.addPerson(bob);

      // Tick to just before water cooler
      for (let i = 0; i < ticksUntil(15, 29); i++) {
        sim.tick();
      }

      // Alice initiates at 15:30
      sim.tick();

      expect(alice.chat.length).toEqual(1);
      expect(alice.chat[0]).toEqual({ from: 'Alice', message: 'hi Bob' });
      expect(bob.chat.length).toEqual(1);
      expect(bob.chat[0]).toEqual({ from: 'Alice', message: 'hi Bob' });

      // Bob responds at 15:31
      sim.tick();

      expect(alice.chat.length).toEqual(2);
      expect(alice.chat[1]).toEqual({ from: 'Bob', message: 'hi Alice' });
      expect(bob.chat.length).toEqual(2);
      expect(bob.chat[1]).toEqual({ from: 'Bob', message: 'hi Alice' });
    });
  });
});
