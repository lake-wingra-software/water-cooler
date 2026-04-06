const makeLlmBrain = require('../src/llm-brain');

function makeClient(response) {
  return {
    messages: {
      create: jasmine.createSpy('create').and.resolveTo(
        response ?? { content: [{ type: 'text', text: 'hey everyone!' }] }
      )
    }
  };
}

function lastCall(client) {
  return client.messages.create.calls.mostRecent().args[0];
}

function captureSystem(client) {
  return lastCall(client).system;
}

function capturePrompt(client) {
  return lastCall(client).messages[0].content;
}

describe('LLM brain', () => {
  it('calls the API and returns message to all others', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    const alice = { name: 'Alice' };
    const bob = { name: 'Bob' };
    const result = await brain({ name: 'Chad', others: [alice, bob], chat: [], location: 'water cooler' });

    expect(client.messages.create).toHaveBeenCalled();
    expect(result).toEqual({ to: [alice, bob], message: 'hey everyone!' });
  });

  it('puts role and traits in the system prompt', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'sarcastic', role: 'senior engineer' }, client, model: 'test-model' });
    await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [], location: 'water cooler' });

    const system = captureSystem(client);
    expect(system).toContain('senior engineer');
    expect(system).toContain('sarcastic');
  });

  it('puts goals in the system prompt when provided', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({
      characterSheet: { traits: 'friendly', role: 'engineer', goals: ['get promoted', 'avoid meetings'] },
      client,
      model: 'test-model'
    });
    await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [], location: 'water cooler' });

    const system = captureSystem(client);
    expect(system).toContain('get promoted');
    expect(system).toContain('avoid meetings');
  });

  it('puts location in the system prompt', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [], location: 'cafeteria' });

    expect(captureSystem(client)).toContain('cafeteria');
  });

  it('puts turns remaining in the system prompt', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model', minutesPerTurn: 8 });
    await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [], location: 'water cooler', minutesRemaining: 24 });

    expect(captureSystem(client)).toContain('3 turns');
  });

  it('omits goals section when not provided', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [], location: 'water cooler' });

    expect(captureSystem(client)).not.toContain('goals');
  });

  it('puts conversation history in the user message', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    const chat = [
      { from: 'Alice', message: 'are we on track?' },
      { from: 'Chad', message: 'yeah' },
    ];
    await brain({ name: 'Alice', others: [{ name: 'Chad' }], chat, location: 'water cooler' });

    const prompt = capturePrompt(client);
    expect(prompt).toContain('are we on track?');
    expect(prompt).toContain('yeah');
  });

  it('returns null without calling the API when no turns remain', async () => {
    const client = { messages: { create: jasmine.createSpy('create') } };
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model', minutesPerTurn: 8 });
    const result = await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [], location: 'water cooler', minutesRemaining: 0 });

    expect(result).toBeNull();
    expect(client.messages.create).not.toHaveBeenCalled();
  });

  it('returns null if the last message is from the speaker', async () => {
    const client = { messages: { create: jasmine.createSpy('create') } };
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    const chat = [
      { from: 'Alice', message: 'hi Chad' },
      { from: 'Chad', message: 'hey!' }
    ];
    const result = await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat, location: 'water cooler' });

    expect(result).toBeNull();
    expect(client.messages.create).not.toHaveBeenCalled();
  });

  it('returns null and logs to stderr on API error', async () => {
    const client = {
      messages: {
        create: jasmine.createSpy('create').and.rejectWith(new Error('credit balance too low'))
      }
    };
    spyOn(console, 'error');

    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    const result = await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [], location: 'water cooler' });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('[Chad] LLM error: credit balance too low');
  });
});
