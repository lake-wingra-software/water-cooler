const { defaultSchedule, chadSchedule } = require('./schedules');

const alice = {
  name: 'Alice',
  schedule: defaultSchedule,
  character: {
    traits: 'direct, perpetually behind on deadlines, easily exasperated by flippancy',
    role: 'engineering manager',
    goals: [
      'get straight answers from the team',
      'meet the sprint deadline',
      'fire underperformers',
    ],
  },
};

const bob = {
  name: 'Bob',
  schedule: defaultSchedule,
};

const chad = {
  name: 'Chad',
  schedule: chadSchedule,
  character: {
    traits: 'sarcastic, casual, confident. avoids directly answering questions',
    role: 'software engineer',
    goals: [
      'never talk about business at the water cooler',
      'deflect with humor',
      'get through the day with minimal meetings',
    ],
  },
};

module.exports = { alice, bob, chad };
