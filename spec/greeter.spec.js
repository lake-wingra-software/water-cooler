const greeter = require('../src/greeter');

describe('greeter brain', () => {
  it('greets the first ungreeted person', () => {
    const bob = { name: 'Bob' };
    const action = greeter({ name: 'Alice', others: [bob], chat: [] });
    expect(action).toEqual({ to: [bob], message: 'hi Bob' });
  });

  it('returns null when everyone has been greeted', () => {
    const bob = { name: 'Bob' };
    const chat = [{ from: 'Alice', message: 'hi Bob' }];
    const action = greeter({ name: 'Alice', others: [bob], chat });
    expect(action).toBeNull();
  });

  it('skips already-greeted people', () => {
    const bob = { name: 'Bob' };
    const carol = { name: 'Carol' };
    const chat = [{ from: 'Alice', message: 'hi Bob' }];
    const action = greeter({ name: 'Alice', others: [bob, carol], chat });
    expect(action).toEqual({ to: [carol], message: 'hi Carol' });
  });
});
