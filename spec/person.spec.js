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

describe('Person', () => {
  describe('activity', () => {
    it('a person should be working at 9am', () => {
      const person = new Person('Alice', createDefaultSchedule());
      expect(person.currentActivity()).toEqual('working');
    });

    it('a person should be at the cafeteria at 12pm', () => {
      const person = new Person('Alice', createDefaultSchedule());
      for (let i = 0; i < ticksUntil(12, 0); i++) {
        person.tick();
      }
      expect(person.currentActivity()).toEqual('cafeteria');
    });
  });

  describe('events', () => {
    it('should emit activityChanged event exactly when activity changes to cafeteria', () => {
      const schedule = [
        { startTime: new Time(9, 0), endTime: new Time(12, 0), activity: 'working' },
        { startTime: new Time(12, 0), endTime: new Time(13, 0), activity: 'cafeteria' }
      ];
      const person = new Person('Alice', schedule);

      const events = [];
      person.on('activityChanged', (data) => {
        events.push(data);
      });

      for (let i = 0; i < ticksUntil(12, 0) + 1; i++) {
        person.tick();
      }

      expect(events.length).toEqual(1);
      expect(events[0].activity).toEqual('cafeteria');
      expect(events[0].time.hour()).toEqual(12);
      expect(events[0].time.minute()).toEqual(0);
    });
  });
});
