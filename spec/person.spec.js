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

});
