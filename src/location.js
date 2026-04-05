class Location {
  constructor(name) {
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
    const tokenHolder = this.occupants[this.tokenIndex];
    const others = this.occupants.filter(p => p !== tokenHolder);
    tokenHolder.receiveToken(others);
    this.tokenIndex = (this.tokenIndex + 1) % this.occupants.length;
  }
}

module.exports = Location;
