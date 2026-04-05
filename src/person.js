const Time = require('./time');

class Person {
  constructor(schedule) {
    this.currentTime = new Time(9, 0);
    this.schedule = schedule;
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);
  }

  currentActivity() {
    for (const slot of this.schedule) {
      if (!this.currentTime.isBefore(slot.startTime) && this.currentTime.isBefore(slot.endTime)) {
        return slot.activity;
      }
    }
  }
}

module.exports = Person;
