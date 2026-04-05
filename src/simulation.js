const Time = require('./time');

const SHARED_LOCATIONS = ['cafeteria', 'water cooler'];

function isSharedLocation(location) {
  return SHARED_LOCATIONS.includes(location);
}

class Simulation {
  constructor() {
    this.currentTime = new Time(9, 0);
    this.people = [];
  }

  addPerson(person) {
    this.people.push(person);
  }

  handleActivityChange(person, change) {
    const location = change.to;

    // Only greet at shared locations
    if (!isSharedLocation(location)) {
      return;
    }

    // Find others at the same location
    const othersAtLocation = this.people.filter(p =>
      p !== person && p.currentActivity() === location
    );

    // If others are here, greet them
    othersAtLocation.forEach(other => {
      const greeting = {
        from: person.name,
        message: `hi ${other.name}`
      };
      other.emit('messageReceived', greeting);
    });
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);

    // Phase 1: update all people
    this.people.forEach(person => person.tick());

    // Phase 2: process activity changes
    this.people.forEach(person => {
      const change = person.getActivityChange();
      if (change && change.to !== undefined) {
        this.handleActivityChange(person, change);
        person.previousActivity = change.to;
      }
    });
  }

  isActiveWorkday() {
    const hour = this.currentTime.hour();
    return hour >= 9 && hour < 17;
  }
}

module.exports = Simulation;
