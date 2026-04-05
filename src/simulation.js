const Time = require('./time');

class Simulation {
  constructor() {
    this.currentTime = new Time(9, 0);
  }

  tick() {
    this.currentTime = this.currentTime.addMinutes(1);
  }

  isActiveWorkday() {
    const hour = this.currentTime.hour();
    return hour >= 9 && hour < 17;
  }
}

module.exports = Simulation;
