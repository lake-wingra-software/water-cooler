const Time = require('./time');

const defaultSchedule = [
  { startTime: new Time(9, 0), endTime: new Time(12, 0), location: 'cubicle' },
  { startTime: new Time(12, 0), endTime: new Time(13, 0), location: 'cafeteria' },
  { startTime: new Time(13, 0), endTime: new Time(15, 30), location: 'cubicle' },
  { startTime: new Time(15, 30), endTime: new Time(16, 30), location: 'water cooler' },
  { startTime: new Time(16, 30), endTime: new Time(17, 0), location: 'cubicle' }
];

const chadSchedule = [
  { startTime: new Time(9, 0), endTime: new Time(10, 0), location: 'water cooler' },
  { startTime: new Time(10, 0), endTime: new Time(13, 30), location: 'cubicle' },
  { startTime: new Time(13, 30), endTime: new Time(14, 30), location: 'cafeteria' },
  { startTime: new Time(14, 30), endTime: new Time(16, 10), location: 'cubicle' },
  { startTime: new Time(16, 10), endTime: new Time(16, 30), location: 'water cooler' },
  { startTime: new Time(16, 30), endTime: new Time(17, 0), location: 'cubicle' }
];

module.exports = { defaultSchedule, chadSchedule };
