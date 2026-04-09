const { EventEmitter } = require("events");
const Time = require("./time");
const Location = require("./location");

const PRIVATE_LOCATIONS = ["cubicle"];

class Simulation extends EventEmitter {
  constructor({ speakerQueue } = {}) {
    super();
    this.currentTime = new Time(9, 0);
    this.people = [];
    this.speakerQueue = speakerQueue;
    this.publicLocations = {};
  }

  ensureLocation(name) {
    if (PRIVATE_LOCATIONS.includes(name)) return;
    if (!this.publicLocations[name]) {
      this.publicLocations[name] = new Location(name, this.speakerQueue);
    }
  }

  handleArrival(person, location) {
    if (this.publicLocations[location]) {
      this.publicLocations[location].arrive(person);
    } else {
      person.startWork(location);
    }
  }

  addPerson(person) {
    this.people.push(person);
    for (const slot of person.schedule) {
      this.ensureLocation(slot.location);
    }
    const change = person.tick(this.currentTime);
    if (change) {
      this.handleArrival(person, change.to);
    }
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);

    this.people.forEach((person) => {
      const change = person.tick(this.currentTime);
      if (change) {
        if (this.publicLocations[change.from]) {
          this.publicLocations[change.from].depart(person);
        }
        this.handleArrival(person, change.to);
        this.emit("locationChanged", {
          person,
          from: change.from,
          to: change.to,
        });
      }
    });

    for (const location of Object.values(this.publicLocations)) {
      location.tick();
    }
  }

  isActiveWorkday() {
    const hour = this.currentTime.hour();
    return hour >= 9 && hour < 17;
  }
}

module.exports = Simulation;
