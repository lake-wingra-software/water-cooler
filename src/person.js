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

  sendMessage({ to, message }) {
    const outgoing = { from: this.name, message };
    this.chat.push(outgoing);
    to.forEach(recipient => recipient.receiveMessage(outgoing));
  }

  receiveToken(others, done) {
    if (!this.brain) { done(); return; }
    const result = this.brain({ name: this.name, others, chat: this.chat });
    if (result && typeof result.then === 'function') {
      result.then(action => { if (action) this.sendMessage(action); done(); });
    } else {
      if (result) this.sendMessage(result);
      done();
    }
  }
}

module.exports = Person;
