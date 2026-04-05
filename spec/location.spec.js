const Location = require('../src/location');

describe('Location', () => {
  describe('occupants', () => {
    it('tracks who is present via arrive and depart', () => {
      const location = new Location('water cooler');
      const alice = { name: 'Alice' };
      const bob = { name: 'Bob' };

      location.arrive(alice);
      location.arrive(bob);
      expect(location.occupants).toEqual([alice, bob]);

      location.depart(alice);
      expect(location.occupants).toEqual([bob]);
    });
  });

  describe('speaking token', () => {
    it('gives the token holder a turn with the others', () => {
      const location = new Location('water cooler');
      const tokenCalls = [];
      const alice = { name: 'Alice', receiveToken(others, done) { tokenCalls.push({ holder: 'Alice', others }); done(); } };
      const bob = { name: 'Bob', receiveToken(others, done) { tokenCalls.push({ holder: 'Bob', others }); done(); } };

      location.arrive(alice);
      location.arrive(bob);

      location.tick();
      expect(tokenCalls.length).toEqual(1);
      expect(tokenCalls[0].holder).toEqual('Alice');
      expect(tokenCalls[0].others).toEqual([bob]);
    });

    it('rotates the token each tick', () => {
      const location = new Location('water cooler');
      const tokenCalls = [];
      const alice = { name: 'Alice', receiveToken(others, done) { tokenCalls.push('Alice'); done(); } };
      const bob = { name: 'Bob', receiveToken(others, done) { tokenCalls.push('Bob'); done(); } };

      location.arrive(alice);
      location.arrive(bob);

      location.tick();
      location.tick();
      location.tick();

      expect(tokenCalls).toEqual(['Alice', 'Bob', 'Alice']);
    });

    it('does not hand out the token while it is held', () => {
      const location = new Location('water cooler');
      const tokenCalls = [];
      const alice = { name: 'Alice', receiveToken(others, done) { tokenCalls.push('Alice'); } };
      const bob = { name: 'Bob', receiveToken(others, done) { tokenCalls.push('Bob'); } };

      location.arrive(alice);
      location.arrive(bob);

      location.tick();  // Alice gets token, doesn't call done
      location.tick();  // should be a no-op
      location.tick();  // still no-op

      expect(tokenCalls).toEqual(['Alice']);
    });

    it('broadcasts the message to all occupants when token holder speaks', () => {
      const location = new Location('water cooler');
      const messages = { alice: [], bob: [], chad: [] };
      const alice = {
        name: 'Alice',
        receiveToken(others, done) { done({ to: [bob], message: 'hi Bob' }); },
        receiveMessage(msg) { messages.alice.push(msg); }
      };
      const bob = {
        name: 'Bob',
        receiveToken(others, done) { done(null); },
        receiveMessage(msg) { messages.bob.push(msg); }
      };
      const chad = {
        name: 'Chad',
        receiveToken(others, done) { done(null); },
        receiveMessage(msg) { messages.chad.push(msg); }
      };

      location.arrive(alice);
      location.arrive(bob);
      location.arrive(chad);

      location.tick(); // Alice speaks

      const expected = { from: 'Alice', message: 'hi Bob' };
      expect(messages.alice).toEqual([expected]);
      expect(messages.bob).toEqual([expected]);
      expect(messages.chad).toEqual([expected]);
    });

    it('emits messageSent when the token holder speaks', () => {
      const location = new Location('water cooler');
      const events = [];
      location.on('messageSent', (data) => events.push(data));

      const alice = {
        name: 'Alice',
        receiveToken(others, done) { done({ to: others, message: 'hi Bob' }); },
        receiveMessage() {}
      };
      const bob = {
        name: 'Bob',
        receiveToken(others, done) { done(null); },
        receiveMessage() {}
      };

      location.arrive(alice);
      location.arrive(bob);

      location.tick();

      expect(events.length).toEqual(1);
      expect(events[0]).toEqual({ from: 'Alice', message: 'hi Bob' });
    });

    it('resets token index when occupants leave and re-enter', () => {
      const location = new Location('water cooler');
      const tokenCalls = [];
      const alice = { name: 'Alice', receiveToken(others, done) { tokenCalls.push('Alice'); done(null); }, receiveMessage() {} };
      const bob = { name: 'Bob', receiveToken(others, done) { tokenCalls.push('Bob'); done(null); }, receiveMessage() {} };
      const chad = { name: 'Chad', receiveToken(others, done) { tokenCalls.push('Chad'); done(null); }, receiveMessage() {} };

      location.arrive(alice);
      location.arrive(bob);
      location.arrive(chad);

      location.tick(); // Alice
      location.tick(); // Bob
      location.tick(); // Chad — tokenIndex now wraps to 0

      location.depart(alice);
      location.depart(bob);
      location.depart(chad);

      // Re-enter with only 2 people
      location.arrive(alice);
      location.arrive(bob);

      location.tick(); // should not crash

      expect(tokenCalls.length).toEqual(4);
    });

    it('handles done callback after occupants have departed', () => {
      const location = new Location('water cooler');
      let savedDone;
      const alice = { name: 'Alice', receiveToken(others, done) { savedDone = done; }, receiveMessage() {} };
      const bob = { name: 'Bob', receiveToken(others, done) { done(null); }, receiveMessage() {} };

      location.arrive(alice);
      location.arrive(bob);

      location.tick(); // Alice gets token, holds it (async)

      location.depart(alice);
      location.depart(bob);

      // done fires after everyone left
      expect(() => savedDone(null)).not.toThrow();

      // New people arrive — should still work
      location.arrive(alice);
      location.arrive(bob);
      location.tick();

      expect(location.tokenHeld).toEqual(true); // token was handed out
    });

    it('does not broadcast if speaker has departed before done fires', () => {
      const location = new Location('water cooler');
      let savedDone;
      const messages = [];
      const alice = { name: 'Alice', receiveToken(others, done) { savedDone = done; }, receiveMessage(msg) { messages.push(msg); } };
      const bob = { name: 'Bob', receiveToken(others, done) { done(null); }, receiveMessage(msg) { messages.push(msg); } };

      location.arrive(alice);
      location.arrive(bob);

      location.tick(); // Alice gets token

      location.depart(alice); // Alice leaves before responding

      savedDone({ to: [bob], message: 'hey bob!' }); // response arrives late

      expect(messages).toEqual([]);
    });

    it('does nothing with fewer than 2 occupants', () => {
      const location = new Location('water cooler');
      const tokenCalls = [];
      const alice = { name: 'Alice', receiveToken() { tokenCalls.push('Alice'); } };

      location.arrive(alice);
      location.tick();

      expect(tokenCalls.length).toEqual(0);
    });
  });
});
