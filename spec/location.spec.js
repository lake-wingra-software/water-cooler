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
