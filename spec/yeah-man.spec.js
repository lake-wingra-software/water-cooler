const yeahMan = require('../src/yeah-man');

describe('yeahMan brain', () => {
  it('greets ungreeted people same as greeter', () => {
    const brain = yeahMan();
    const bob = { name: 'Bob' };
    const result = brain({ name: 'Alice', others: [bob], chat: [] });
    expect(result).toEqual({ to: [bob], message: 'hi Bob' });
  });

  it('responds with canned response to statements', () => {
    const brain = yeahMan();
    const chat = [
      { from: 'Alice', message: 'hi Bob' },
      { from: 'Bob', message: 'hi Alice' },
      { from: 'Alice', message: 'nice weather today' }
    ];
    const result = brain({ name: 'Bob', others: [{ name: 'Alice' }], chat });
    expect(result).toEqual({ to: [{ name: 'Alice' }], message: 'oh yeah?' });
  });

  it('responds with a question dodge when last message ends with ?', () => {
    const brain = yeahMan();
    const chat = [
      { from: 'Alice', message: 'hi Bob' },
      { from: 'Bob', message: 'hi Alice' },
      { from: 'Alice', message: 'is the work done?' }
    ];
    const result = brain({ name: 'Bob', others: [{ name: 'Alice' }], chat });
    expect(result.message).toEqual('haha yeah, man');
  });

  it('cycles question dodges independently from statement responses', () => {
    const brain = yeahMan();
    const alice = { name: 'Alice' };
    const chat1 = [
      { from: 'Alice', message: 'hi Bob' }, { from: 'Bob', message: 'hi Alice' },
      { from: 'Alice', message: 'done yet?' }
    ];
    const chat2 = [
      ...chat1,
      { from: 'Bob', message: 'haha yeah, man' },
      { from: 'Alice', message: 'seriously though?' }
    ];

    const result1 = brain({ name: 'Bob', others: [alice], chat: chat1 });
    const result2 = brain({ name: 'Bob', others: [alice], chat: chat2 });

    expect(result1.message).toEqual('haha yeah, man');
    expect(result2.message).toEqual('no, yeah...');
  });

  it('cycles through canned responses', () => {
    const brain = yeahMan();
    const alice = { name: 'Alice' };
    const chat1 = [
      { from: 'Alice', message: 'hi Bob' }, { from: 'Bob', message: 'hi Alice' },
      { from: 'Alice', message: 'nice weather' }
    ];
    const chat2 = [
      { from: 'Alice', message: 'hi Bob' }, { from: 'Bob', message: 'hi Alice' },
      { from: 'Alice', message: 'nice weather' }, { from: 'Bob', message: 'oh yeah?' },
      { from: 'Alice', message: 'totally' }
    ];

    const result1 = brain({ name: 'Bob', others: [alice], chat: chat1 });
    const result2 = brain({ name: 'Bob', others: [alice], chat: chat2 });

    expect(result1.message).toEqual('oh yeah?');
    expect(result2.message).toEqual('for sure');
  });

  it('returns null if last message is from self', () => {
    const brain = yeahMan();
    const chat = [
      { from: 'Bob', message: 'hi Alice' },
      { from: 'Alice', message: 'hi Bob' },
      { from: 'Alice', message: 'nice weather' },
      { from: 'Bob', message: 'oh yeah?' }
    ];
    const result = brain({ name: 'Bob', others: [{ name: 'Alice' }], chat });
    expect(result).toBeNull();
  });

  it('returns null if chat is empty and everyone is greeted', () => {
    const brain = yeahMan();
    const bob = { name: 'Bob' };
    const chat = [
      { from: 'Alice', message: 'hi Bob' },
      { from: 'Bob', message: 'hi Alice' }
    ];
    // last message is from Bob, so should return null
    const result = brain({ name: 'Bob', others: [{ name: 'Alice' }], chat });
    expect(result).toBeNull();
  });
});
