const { EventEmitter } = require('events');

class Person extends EventEmitter {
  constructor(name, schedule, brain) {
    super();
    this.name = name;
    this.schedule = schedule;
    this.brain = brain;
    this.currentTime = schedule[0].startTime;
    this.previousLocation = this.currentLocation();
    this.chat = [];
  }

  tick(time) {
    this.currentTime = time;
    const prev = this.previousLocation;
    const curr = this.currentLocation();
    if (curr !== prev && curr !== undefined) {
      this.chat = [];
      this.previousLocation = curr;
      return { from: prev, to: curr };
    }
    return null;
  }

  currentLocation() {
    for (const slot of this.schedule) {
      if (!this.currentTime.isBefore(slot.startTime) && this.currentTime.isBefore(slot.endTime)) {
        return slot.location;
      }
    }
  }

  receiveMessage(message) {
    this.chat.push(message);
    this.emit('messageReceived', message);
  }

  minutesRemainingAtLocation() {
    for (const slot of this.schedule) {
      if (!this.currentTime.isBefore(slot.startTime) && this.currentTime.isBefore(slot.endTime)) {
        const end = slot.endTime.hour() * 60 + slot.endTime.minute();
        const now = this.currentTime.hour() * 60 + this.currentTime.minute();
        return end - now;
      }
    }
    return 0;
  }

  receiveToken(others, location, done) {
    if (!this.brain) { done(null); return; }
    const minutesRemaining = this.minutesRemainingAtLocation();
    const result = this.brain({ name: this.name, others, chat: this.chat, location, minutesRemaining });
    if (result && typeof result.then === 'function') {
      result.then(action => done(action));
    } else {
      done(result);
    }
  }
}

module.exports = Person;
