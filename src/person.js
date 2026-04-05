const Time = require('./time');
const { EventEmitter } = require('events');

class Person extends EventEmitter {
  constructor(name, schedule) {
    super();
    this.name = name;
    this.currentTime = new Time(9, 0);
    this.schedule = schedule;
    this.previousActivity = this.currentActivity();
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);
    const newActivity = this.currentActivity();

    if (newActivity !== this.previousActivity && newActivity !== undefined) {
      this.previousActivity = newActivity;
      this.emit('activityChanged', {
        name: this.name,
        activity: newActivity,
        time: this.currentTime
      });
    }
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
