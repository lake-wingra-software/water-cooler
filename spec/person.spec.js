const Person = require('../src/person');
const { defaultSchedule } = require('../src/schedules');

function ticksUntil(hour, minute) {
  return (hour * 60 + minute) - (9 * 60);
}

describe('Person', () => {
  describe('activity', () => {
    it('a person should be working at 9am', () => {
      const person = new Person('Alice', defaultSchedule);
      expect(person.currentActivity()).toEqual('working');
    });

    it('a person should be at the cafeteria at 12pm', () => {
      const person = new Person('Alice', defaultSchedule);
      for (let i = 0; i < ticksUntil(12, 0); i++) {
        person.tick();
      }
      expect(person.currentActivity()).toEqual('cafeteria');
    });

    it('should emit activityChanged event when activity changes', () => {
      const person = new Person('Alice', defaultSchedule);

      const events = [];
      person.on('activityChanged', (data) => events.push(data));

      for (let i = 0; i < ticksUntil(12, 0); i++) {
        person.tick();
      }

      expect(events.length).toEqual(1);
      expect(events[0].activity).toEqual('cafeteria');
      expect(events[0].name).toEqual('Alice');
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
