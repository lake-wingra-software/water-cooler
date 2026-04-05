const Time = require('./time');

class Simulation {
  constructor() {
    this.currentTime = new Time(9, 0);
    this.people = [];
  }

  addPerson(person) {
    this.people.push(person);
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);
    this.people.forEach(person => person.tick());
  }

  isActiveWorkday() {
    const hour = this.currentTime.hour();
    return hour >= 9 && hour < 17;
  }
}

module.exports = Simulation;
