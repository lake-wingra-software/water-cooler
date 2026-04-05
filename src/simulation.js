const Time = require('./time');

const SHARED_LOCATIONS = ['cafeteria', 'water cooler'];

function isSharedLocation(location) {
  return SHARED_LOCATIONS.includes(location);
}

class Simulation {
  constructor() {
    this.currentTime = new Time(9, 0);
    this.people = [];
    this.locationLists = {};   // { locationName: [person, ...] }
    this.locationTokens = {};  // { locationName: index }
  }

  addPerson(person) {
    this.people.push(person);
    person.on('messageSent', ({ to, from, message }) => {
      to.forEach(recipient => recipient.receiveMessage({ from, message }));
    });
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);

    // Phase 1: update all people
    this.people.forEach(person => person.tick());

    // Phase 2: process activity changes - maintain location lists
    this.people.forEach(person => {
      const change = person.getActivityChange();
      if (change && change.to !== undefined) {
        if (isSharedLocation(change.from)) {
          const list = this.locationLists[change.from];
          if (list) {
            list.splice(list.indexOf(person), 1);
          }
        }
        if (isSharedLocation(change.to)) {
          if (!this.locationLists[change.to]) {
            this.locationLists[change.to] = [];
            this.locationTokens[change.to] = 0;
          }
          this.locationLists[change.to].push(person);
        }
        person.previousActivity = change.to;
      }
    });

    // Phase 3: process speaking token per location
    for (const [location, list] of Object.entries(this.locationLists)) {
      if (list.length < 2) continue;
      const index = this.locationTokens[location];
      const tokenHolder = list[index];
      const others = list.filter(p => p !== tokenHolder);
      tokenHolder.receiveToken(others);
      this.locationTokens[location] = (index + 1) % list.length;
    }
  }

  isActiveWorkday() {
    const hour = this.currentTime.hour();
    return hour >= 9 && hour < 17;
  }
}

module.exports = Simulation;
