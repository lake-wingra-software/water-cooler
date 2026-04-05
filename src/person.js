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

    const newLocation = this.currentLocation();
    if (newLocation !== this.previousLocation && newLocation !== undefined) {
      this.chat = [];  // Reset chat when moving to new location
      this.emit('locationChanged', {
        name: this.name,
        location: newLocation,
        time: this.currentTime
      });
    }
  }

  currentLocation() {
    for (const slot of this.schedule) {
      if (!this.currentTime.isBefore(slot.startTime) && this.currentTime.isBefore(slot.endTime)) {
        return slot.location;
      }
    }
  }

  getLocationChange() {
    const current = this.currentLocation();
    if (current !== this.previousLocation) {
      return { from: this.previousLocation, to: current };
    }
    return null;
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
