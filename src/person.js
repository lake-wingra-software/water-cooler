const { EventEmitter } = require('events');

class Person extends EventEmitter {
  constructor(name, schedule) {
    super();
    this.name = name;
    this.schedule = schedule;
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
    this.emit('messageSent', { to, from: this.name, message });
  }

  receiveToken(others) {
    const ungreeted = others.filter(other =>
      !this.chat.some(m => m.from === this.name && m.message === `hi ${other.name}`)
    );
    if (ungreeted.length > 0) {
      this.sendMessage({ to: ungreeted, message: `hi ${ungreeted[0].name}` });
    }
  }
}

module.exports = Person;
