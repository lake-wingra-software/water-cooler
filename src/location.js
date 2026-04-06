const { EventEmitter } = require('events');

function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

class Location extends EventEmitter {
  constructor(name, buildQueue = shuffle) {
    super();
    this.name = name;
    this.occupants = [];
    this.speakingQueue = [];
    this.buildQueue = buildQueue;
    this.tokenHeld = false;
  }

  arrive(person) {
    this.occupants.push(person);
  }

  depart(person) {
    this.occupants.splice(this.occupants.indexOf(person), 1);
    if (this.occupants.length < 2) {
      this.speakingQueue = [];
    }
  }

  tick() {
    if (this.occupants.length < 2) return;
    if (this.tokenHeld) return;

    if (this.speakingQueue.length === 0) {
      this.speakingQueue = this.buildQueue(this.occupants);
    }

    while (this.speakingQueue.length > 0 && !this.occupants.includes(this.speakingQueue[0])) {
      this.speakingQueue.shift();
    }

    if (this.speakingQueue.length === 0) return;

    this.tokenHeld = true;
    const tokenHolder = this.speakingQueue.shift();
    const others = this.occupants.filter(p => p !== tokenHolder);
    tokenHolder.receiveToken(others, this.name, (action) => {
      if (action && this.occupants.includes(tokenHolder)) {
        const outgoing = { from: tokenHolder.name, message: action.message };
        this.occupants.forEach(p => p.receiveMessage(outgoing));
        this.emit('messageSent', outgoing);
      }
      this.tokenHeld = false;
    });
  }
}

module.exports = Location;
