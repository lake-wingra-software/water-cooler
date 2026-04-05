const { EventEmitter } = require('events');

class Location extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.occupants = [];
    this.tokenIndex = 0;
  }

  arrive(person) {
    this.occupants.push(person);
  }

  depart(person) {
    this.occupants.splice(this.occupants.indexOf(person), 1);
  }

  tick() {
    if (this.occupants.length < 2) return;
    if (this.tokenHeld) return;
    this.tokenHeld = true;
    const tokenHolder = this.occupants[this.tokenIndex];
    const others = this.occupants.filter(p => p !== tokenHolder);
    tokenHolder.receiveToken(others, (action) => {
      if (action) {
        const outgoing = { from: tokenHolder.name, message: action.message };
        this.occupants.forEach(p => p.receiveMessage(outgoing));
        this.emit('messageSent', outgoing);
      }
      this.tokenIndex = (this.tokenIndex + 1) % this.occupants.length;
      this.tokenHeld = false;
    });
  }
}

module.exports = Location;
