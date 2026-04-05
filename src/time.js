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

  isBefore(other) {
    if (this._hour !== other._hour) {
      return this._hour < other._hour;
    }
    return this._minute < other._minute;
  }

  equals(other) {
    return this._hour === other._hour && this._minute === other._minute;
  }

  toString() {
    const minuteStr = this._minute.toString().padStart(2, '0');
    return `${this._hour}:${minuteStr}`;
  }
}

module.exports = Time;
