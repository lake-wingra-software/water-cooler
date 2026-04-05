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

  receiveToken(others, done) {
    if (!this.brain) { done(null); return; }
    const result = this.brain({ name: this.name, others, chat: this.chat });
    if (result && typeof result.then === 'function') {
      result.then(action => done(action));
    } else {
      done(result);
    }
  }
}

module.exports = Person;
