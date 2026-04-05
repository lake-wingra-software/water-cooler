const Person = require('../src/person');
const Time = require('../src/time');
const { defaultSchedule } = require('../src/schedules');

function ticksUntil(hour, minute) {
  return (hour * 60 + minute) - (9 * 60);
}

describe('Person', () => {
  describe('location', () => {
    it('a person should be at their cubicle at 9am', () => {
      const person = new Person('Alice', defaultSchedule);
      expect(person.currentLocation()).toEqual('cubicle');
    });

    it('a person should be at the cafeteria at 12pm', () => {
      const person = new Person('Alice', defaultSchedule);
      person.tick(new Time(12, 0));
      expect(person.currentLocation()).toEqual('cafeteria');
    });

    it('tick returns location change when location changes', () => {
      const person = new Person('Alice', defaultSchedule);
      const change = person.tick(new Time(12, 0));
      expect(change).toEqual({ from: 'cubicle', to: 'cafeteria' });
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

    it('sendMessage adds to own chat and emits messageSent', () => {
      const alice = new Person('Alice', defaultSchedule);
      const bob = new Person('Bob', defaultSchedule);

      const sent = [];
      alice.on('messageSent', (event) => sent.push(event));

      alice.sendMessage({ to: [bob], message: 'hi Bob' });

      expect(alice.chat.length).toEqual(1);
      expect(alice.chat[0]).toEqual({ from: 'Alice', message: 'hi Bob' });
      expect(sent.length).toEqual(1);
      expect(sent[0]).toEqual({ to: [bob], from: 'Alice', message: 'hi Bob' });
    });

    it('receiveToken sends a greeting to ungreeted people', () => {
      const alice = new Person('Alice', defaultSchedule);
      const bob = new Person('Bob', defaultSchedule);

      const sent = [];
      alice.on('messageSent', (event) => sent.push(event));

      alice.receiveToken([bob]);

      expect(sent.length).toEqual(1);
      expect(sent[0].message).toEqual('hi Bob');
      expect(sent[0].to).toEqual([bob]);
    });

    it('receiveToken does not greet someone already greeted', () => {
      const alice = new Person('Alice', defaultSchedule);
      const bob = new Person('Bob', defaultSchedule);

      alice.receiveToken([bob]);  // greets Bob

      const sent = [];
      alice.on('messageSent', (event) => sent.push(event));

      alice.receiveToken([bob]);  // already greeted — nothing sent

      expect(sent.length).toEqual(0);
    });
  });
});
