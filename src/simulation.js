const { EventEmitter } = require("events");
const Time = require("./time");
const Location = require("./location");

const SHARED_LOCATIONS = ["cafeteria", "conference room", "water cooler"];

class Simulation extends EventEmitter {
  constructor({ speakerQueue } = {}) {
    super();
    this.currentTime = new Time(9, 0);
    this.people = [];
    this.locations = {};
    SHARED_LOCATIONS.forEach((name) => {
      this.locations[name] = new Location(name, speakerQueue);
    });
  }

  addPerson(person) {
    this.people.push(person);
    const location = person.currentLocation();
    if (this.locations[location]) {
      this.locations[location].arrive(person);
    }
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);

    this.people.forEach((person) => {
      const change = person.tick(this.currentTime);
      if (change) {
        if (this.locations[change.from]) {
          this.locations[change.from].depart(person);
        }
        if (this.locations[change.to]) {
          this.locations[change.to].arrive(person);
        }
        this.emit("locationChanged", {
          person,
          from: change.from,
          to: change.to,
        });
      }
    });

    for (const location of Object.values(this.locations)) {
      location.tick();
    }
  }

  isActiveWorkday() {
    const hour = this.currentTime.hour();
    return hour >= 9 && hour < 17;
  }
}

module.exports = Simulation;
