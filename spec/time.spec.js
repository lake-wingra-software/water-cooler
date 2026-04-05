const Time = require('../src/time');

describe('Time', () => {
  it('should create a time with hour and minute', () => {
    const time = new Time(9, 0);
    expect(time.hour()).toEqual(9);
    expect(time.minute()).toEqual(0);
  });

  it('should add minutes and return a new Time', () => {
    const time = new Time(9, 0);
    const nextMinute = time.addMinutes(1);
    expect(nextMinute.minute()).toEqual(1);
    expect(nextMinute.hour()).toEqual(9);
  });

  it('should roll over hour at 60 minutes', () => {
    const time = new Time(9, 59);
    const nextMinute = time.addMinutes(1);
    expect(nextMinute.hour()).toEqual(10);
    expect(nextMinute.minute()).toEqual(0);
  });

  it('should be immutable - original time unchanged after addMinutes', () => {
    const time = new Time(9, 0);
    const nextMinute = time.addMinutes(1);
    expect(time.minute()).toEqual(0);
  });

  it('should compare times with isBefore', () => {
    const time1 = new Time(9, 0);
    const time2 = new Time(9, 1);
    expect(time1.isBefore(time2)).toEqual(true);
    expect(time2.isBefore(time1)).toEqual(false);
  });

  it('should compare times with equals', () => {
    const time1 = new Time(9, 0);
    const time2 = new Time(9, 0);
    const time3 = new Time(9, 1);
    expect(time1.equals(time2)).toEqual(true);
    expect(time1.equals(time3)).toEqual(false);
  });

  it('should format time as string', () => {
    expect(new Time(9, 0).toString()).toEqual('9:00');
    expect(new Time(9, 5).toString()).toEqual('9:05');
    expect(new Time(10, 30).toString()).toEqual('10:30');
  });
});
