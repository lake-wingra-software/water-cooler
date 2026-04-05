const Person = require('../src/person');
const Time = require('../src/time');
const { defaultSchedule } = require('../src/schedules');

function ticksUntil(hour, minute) {
  return (hour * 60 + minute) - (9 * 60);
}

describe('Person', () => {
  describe('location', () => {
    it('a person should be at the water cooler at 9am', () => {
      const person = new Person('Alice', defaultSchedule);
      expect(person.currentLocation()).toEqual('water cooler');
    });

    it('a person should be at the cafeteria at 12pm', () => {
      const person = new Person('Alice', defaultSchedule);
      person.tick(new Time(12, 0));
      expect(person.currentLocation()).toEqual('cafeteria');
    });

    it('tick returns location change when location changes', () => {
      const person = new Person('Alice', defaultSchedule);
      const change = person.tick(new Time(12, 0));
      expect(change).toEqual({ from: 'water cooler', to: 'cafeteria' });
    });

    it('tick returns null when location stays the same', () => {
      const person = new Person('Alice', defaultSchedule);
      const change = person.tick(new Time(9, 1));
      expect(change).toBeNull();
    });
  });

  describe('messaging', () => {
    it('receiveMessage adds to chat and emits messageReceived', () => {
      const alice = new Person('Alice', defaultSchedule);

      const received = [];
      alice.on('messageReceived', (msg) => received.push(msg));

      alice.receiveMessage({ from: 'Bob', message: 'hi Alice' });

      expect(alice.chat.length).toEqual(1);
      expect(alice.chat[0]).toEqual({ from: 'Bob', message: 'hi Alice' });
      expect(received.length).toEqual(1);
      expect(received[0]).toEqual({ from: 'Bob', message: 'hi Alice' });
    });


    it('receiveToken delegates to brain and passes action to done', () => {
      const bob = new Person('Bob', defaultSchedule);
      const fakeBrain = () => ({ to: [bob], message: 'hey!' });
      const alice = new Person('Alice', defaultSchedule, fakeBrain);

      let receivedAction;
      alice.receiveToken([bob], (action) => { receivedAction = action; });

      expect(receivedAction).toEqual({ to: [bob], message: 'hey!' });
    });

    it('receiveToken does nothing when brain returns null', () => {
      const fakeBrain = () => null;
      const alice = new Person('Alice', defaultSchedule, fakeBrain);

      const sent = [];
      alice.on('messageSent', (event) => sent.push(event));

      alice.receiveToken([], () => {});

      expect(sent.length).toEqual(0);
    });

    it('receiveToken does nothing when person has no brain', () => {
      const alice = new Person('Alice', defaultSchedule);

      const sent = [];
      alice.on('messageSent', (event) => sent.push(event));

      alice.receiveToken([], () => {});

      expect(sent.length).toEqual(0);
    });
  });
});
