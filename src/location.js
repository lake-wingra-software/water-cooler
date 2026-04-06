const { EventEmitter } = require("events");

function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

class Location extends EventEmitter {
  constructor(name, orderSpeakers = shuffle) {
    super();
    this.name = name;
    this.occupants = [];
    this.speakerOrder = [];
    this.orderSpeakers = orderSpeakers;
    this.tokenHeld = false;
  }

  arrive(person) {
    this.occupants.push(person);
  }

  depart(person) {
    const index = this.occupants.indexOf(person);
    if (index === -1) return;
    this.occupants.splice(index, 1);
    if (this.occupants.length < 2) {
      this.speakerOrder = [];
    }
  }

  nextSpeaker() {
    if (this.speakerOrder.length === 0) {
      this.speakerOrder = this.orderSpeakers(this.occupants);
    }

    while (
      this.speakerOrder.length > 0 &&
      !this.occupants.includes(this.speakerOrder[0])
    ) {
      this.speakerOrder.shift();
    }

    return this.speakerOrder.shift();
  }

  broadcast(tokenHolder, action) {
    if (!action || !this.occupants.includes(tokenHolder)) return;
    const outgoing = { from: tokenHolder.name, message: action.message };
    this.occupants.forEach((p) => p.receiveMessage(outgoing));
    this.emit("messageSent", outgoing);
  }

  tick() {
    if (this.occupants.length < 2) return;
    if (this.tokenHeld) return;

    const speaker = this.nextSpeaker();
    if (!speaker) return;

    this.tokenHeld = true;
    const others = this.occupants.filter((p) => p !== speaker);
    speaker.receiveToken(others, this.name, (action) => {
      this.broadcast(speaker, action);
      this.tokenHeld = false;
    });
  }
}

module.exports = Location;
