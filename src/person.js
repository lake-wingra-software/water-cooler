const { EventEmitter } = require("events");
const Time = require("./time");

class Person extends EventEmitter {
  constructor({ name, schedule, character }, brain, { reflector } = {}) {
    super();
    this.name = name;
    this.schedule = schedule;
    this.character = character;
    this.brain = brain;
    this.reflector = reflector;
    this.currentTime = new Time(0, 0);
    this.previousLocation = this.currentLocation();
    this.chat = [];
  }

  tick(time) {
    this.currentTime = time;
    const currentLocation = this.currentLocation();
    if (currentLocation !== this.previousLocation && currentLocation !== undefined) {
      if (this.reflector && this.chat.length > 0) {
        this.reflector({ name: this.name, chat: [...this.chat] });
      }
      const from = this.previousLocation;
      this.chat = [];
      this.previousLocation = currentLocation;
      return { from, to: currentLocation };
    }
    return null;
  }

  currentSlot() {
    return this.schedule.find(
      (slot) =>
        !this.currentTime.isBefore(slot.startTime) &&
        this.currentTime.isBefore(slot.endTime),
    );
  }

  currentLocation() {
    const slot = this.currentSlot();
    return slot && slot.location;
  }

  receiveMessage(message) {
    this.chat.push(message);
    this.emit("messageReceived", message);
  }

  minutesRemainingAtLocation() {
    const slot = this.currentSlot();
    if (!slot) return 0;
    return slot.endTime.toMinutes() - this.currentTime.toMinutes();
  }

  startWork(location) {
    this.receiveToken([], location, () => {});
  }

  receiveToken(others, location, done) {
    if (!this.brain) {
      done(null);
      return;
    }
    const lastEntry = this.chat[this.chat.length - 1];
    if (lastEntry && lastEntry.from === this.name && lastEntry.message === "[done]") {
      done(null);
      return;
    }
    const minutesRemaining = this.minutesRemainingAtLocation();
    const result = this.brain({
      name: this.name,
      character: this.character,
      others,
      chat: this.chat,
      location,
      minutesRemaining,
    });
    const handle = (action) => {
      if (!action && this.chat.length > 0) {
        this.chat.push({ from: this.name, message: "[done]" });
      }
      done(action);
    };
    if (result && typeof result.then === "function") {
      result.then(handle);
    } else {
      handle(result);
    }
  }
}

module.exports = Person;
