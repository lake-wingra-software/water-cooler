const makeLlmBrain = require('../src/llm-brain');

describe('LLM brain', () => {
  it('calls the API and returns message to all others', async () => {
    const fakeClient = {
      messages: {
        create: jasmine.createSpy('create').and.resolveTo({
          content: [{ type: 'text', text: 'hey everyone!' }]
        })
      }
    };

    const brain = makeLlmBrain({ personality: 'friendly', client: fakeClient, model: 'test-model' });
    const alice = { name: 'Alice' };
    const bob = { name: 'Bob' };
    const result = await brain({ name: 'Chad', others: [alice, bob], chat: [] });

    expect(fakeClient.messages.create).toHaveBeenCalled();
    expect(result).toEqual({ to: [alice, bob], message: 'hey everyone!' });
  });

  it('returns null and logs to stderr on API error', async () => {
    const fakeClient = {
      messages: {
        create: jasmine.createSpy('create').and.rejectWith(new Error('credit balance too low'))
      }
    };
    spyOn(console, 'error');

    const brain = makeLlmBrain({ personality: 'friendly', client: fakeClient, model: 'test-model' });
    const result = await brain({ name: 'Chad', others: [{ name: 'Alice' }], chat: [] });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('[Chad] LLM error: credit balance too low');
  });
});
