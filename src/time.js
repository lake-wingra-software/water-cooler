class Time {
  constructor(hour, minute) {
    this._hour = hour;
    this._minute = minute;
  }

  hour() {
    return this._hour;
  }

  minute() {
    return this._minute;
  }

  addMinutes(minutes) {
    let newHour = this._hour;
    let newMinute = this._minute + minutes;

    while (newMinute >= 60) {
      newMinute -= 60;
      newHour += 1;
    }

    return new Time(newHour, newMinute);
  }

  toMinutes() {
    return this._hour * 60 + this._minute;
  }

  isBefore(other) {
    return this.toMinutes() < other.toMinutes();
  }

  equals(other) {
    return this.toMinutes() === other.toMinutes();
  }

  toString() {
    const minuteStr = this._minute.toString().padStart(2, '0');
    return `${this._hour}:${minuteStr}`;
  }
}

module.exports = Time;
