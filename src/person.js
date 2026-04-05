const Time = require('./time');
const { EventEmitter } = require('events');

class Person extends EventEmitter {
  constructor(name, schedule) {
    super();
    this.name = name;
    this.currentTime = new Time(9, 0);
    this.schedule = schedule;
    this.previousActivity = this.currentActivity();
    this.chat = [];
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);

    const newActivity = this.currentActivity();
    if (newActivity !== this.previousActivity && newActivity !== undefined) {
      this.chat = [];  // Reset chat when moving to new location
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

  getActivityChange() {
    const current = this.currentActivity();
    if (current !== this.previousActivity) {
      return { from: this.previousActivity, to: current };
    }
    return null;
  }

  addMessageToChat(message) {
    this.chat.push(message);
  }
}

module.exports = Person;
