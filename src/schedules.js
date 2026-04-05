const Time = require('./time');

const defaultSchedule = [
  { startTime: new Time(9, 0), endTime: new Time(12, 0), activity: 'working' },
  { startTime: new Time(12, 0), endTime: new Time(13, 0), activity: 'cafeteria' },
  { startTime: new Time(13, 0), endTime: new Time(15, 30), activity: 'working' },
  { startTime: new Time(15, 30), endTime: new Time(16, 30), activity: 'water cooler' },
  { startTime: new Time(16, 30), endTime: new Time(17, 0), activity: 'working' }
];

module.exports = { defaultSchedule };
