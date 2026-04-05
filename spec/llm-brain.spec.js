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

function capturePrompt(client) {
  return client.messages.create.calls.mostRecent().args[0].messages[0].content;
}

describe('LLM brain', () => {
  it('calls the API and returns message to all others', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    const alice = { name: 'Alice' };
    const bob = { name: 'Bob' };
    const result = await brain({ name: 'Chad', others: [alice, bob], chat: [] });

    expect(client.messages.create).toHaveBeenCalled();
    expect(result).toEqual({ to: [alice, bob], message: 'hey everyone!' });
  });

  it('includes role and traits in the prompt', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'sarcastic', role: 'senior engineer' }, client, model: 'test-model' });
    await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [] });

    const prompt = capturePrompt(client);
    expect(prompt).toContain('senior engineer');
    expect(prompt).toContain('sarcastic');
  });

  it('includes goals in the prompt when provided', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({
      characterSheet: { traits: 'friendly', role: 'engineer', goals: ['get promoted', 'avoid meetings'] },
      client,
      model: 'test-model'
    });
    await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [] });

    const prompt = capturePrompt(client);
    expect(prompt).toContain('get promoted');
    expect(prompt).toContain('avoid meetings');
  });

  it('omits goals section when not provided', async () => {
    const client = makeClient();
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [] });

    const prompt = capturePrompt(client);
    expect(prompt).not.toContain('goals');
  });

  it('returns null if the last message is from the speaker', async () => {
    const client = { messages: { create: jasmine.createSpy('create') } };
    const brain = makeLlmBrain({ characterSheet: { traits: 'friendly', role: 'engineer' }, client, model: 'test-model' });
    const chat = [
      { from: 'Alice', message: 'hi Chad' },
      { from: 'Chad', message: 'hey!' }
    ];
    const result = await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat });

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
    const result = await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [] });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('[Chad] LLM error: credit balance too low');
  });
});
