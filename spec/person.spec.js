const Person = require("../src/person");
const Time = require("../src/time");

const testSchedule = [
  {
    startTime: new Time(9, 0),
    endTime: new Time(12, 0),
    location: "water cooler",
  },
  {
    startTime: new Time(12, 0),
    endTime: new Time(17, 0),
    location: "cafeteria",
  },
];

const testCharDef = {
  name: "Alice",
  schedule: testSchedule,
  character: { traits: "friendly", role: "tester" },
};

describe("Person", () => {
  describe("location", () => {
    it("a person should be at the water cooler at 9am", () => {
      const person = new Person(testCharDef);
      person.tick(new Time(9, 0));
      expect(person.currentLocation()).toEqual("water cooler");
    });

    it("a person should be at the cafeteria at 12pm", () => {
      const person = new Person(testCharDef);
      person.tick(new Time(12, 0));
      expect(person.currentLocation()).toEqual("cafeteria");
    });

    it("tick returns location change when location changes", () => {
      const person = new Person(testCharDef);
      person.tick(new Time(9, 0));
      const change = person.tick(new Time(12, 0));
      expect(change).toEqual({ from: "water cooler", to: "cafeteria" });
    });

    it("tick returns null when location stays the same", () => {
      const person = new Person(testCharDef);
      person.tick(new Time(9, 0));
      const change = person.tick(new Time(9, 1));
      expect(change).toBeNull();
    });
  });

  describe("messaging", () => {
    it("receiveMessage adds to chat and emits messageReceived", () => {
      const alice = new Person(testCharDef);

      const received = [];
      alice.on("messageReceived", (msg) => received.push(msg));

      alice.receiveMessage({ from: "Bob", message: "hi Alice" });

      expect(alice.chat.length).toEqual(1);
      expect(alice.chat[0]).toEqual({ from: "Bob", message: "hi Alice" });
      expect(received.length).toEqual(1);
      expect(received[0]).toEqual({ from: "Bob", message: "hi Alice" });
    });

    it("receiveToken passes character to brain", () => {
      let receivedArgs;
      const alice = new Person(testCharDef, (args) => {
        receivedArgs = args;
        return null;
      });

      alice.receiveToken([], "water cooler", () => {});

      expect(receivedArgs.character).toEqual({
        traits: "friendly",
        role: "tester",
      });
    });

    it("receiveToken passes workspace cwd to brain based on person name", () => {
      let receivedArgs;
      const alice = new Person(testCharDef, (args) => {
        receivedArgs = args;
        return null;
      });

      alice.receiveToken([], "cubicle", () => {});

      expect(receivedArgs.cwd).toMatch(/workspaces\/alice$/);
    });

    it("receiveToken passes workspace bag to brain", () => {
      let receivedArgs;
      const alice = new Person(testCharDef, (args) => {
        receivedArgs = args;
        return null;
      });

      alice.receiveToken([], "cubicle", () => {});

      expect(Array.isArray(receivedArgs.bag)).toBe(true);
    });

    it("receiveToken passes minutesRemaining at current location to brain", () => {
      let receivedArgs;
      const alice = new Person(testCharDef, (args) => {
        receivedArgs = args;
        return null;
      });

      alice.tick(new Time(11, 0)); // 1 hour before leaving water cooler (ends at 12:00)
      alice.receiveToken([], "water cooler", () => {});

      expect(receivedArgs.minutesRemaining).toEqual(60);
    });

    it("receiveToken delegates to brain and passes action to done", () => {
      const bob = new Person({ name: "Bob", schedule: testSchedule });
      const fakeBrain = () => ({ to: [bob], message: "hey!" });
      const alice = new Person(testCharDef, fakeBrain);

      let receivedAction;
      alice.receiveToken([bob], "cafeteria", (action) => {
        receivedAction = action;
      });

      expect(receivedAction).toEqual({ to: [bob], message: "hey!" });
    });

    it("receiveToken does nothing when brain returns null", () => {
      const fakeBrain = () => null;
      const alice = new Person(testCharDef, fakeBrain);

      const sent = [];
      alice.on("messageSent", (event) => sent.push(event));

      alice.receiveToken([], "cafeteria", () => {});

      expect(sent.length).toEqual(0);
    });

    it("receiveToken does nothing when person has no brain", () => {
      const alice = new Person(testCharDef);

      const sent = [];
      alice.on("messageSent", (event) => sent.push(event));

      alice.receiveToken([], "cafeteria", () => {});

      expect(sent.length).toEqual(0);
    });
  });

  describe("conversation done", () => {
    it("appends [done] to own chat when brain returns null and chat is non-empty", () => {
      const fakeBrain = () => null;
      const alice = new Person(testCharDef, fakeBrain);

      alice.receiveMessage({ from: "Bob", message: "hi Alice" });
      alice.receiveToken([{ name: "Bob" }], "water cooler", () => {});

      expect(alice.chat.length).toEqual(2);
      expect(alice.chat[1]).toEqual({ from: "Alice", message: "[done]" });
    });

    it("skips brain when last chat entry is own [done]", () => {
      let brainCalls = 0;
      const fakeBrain = () => { brainCalls++; return null; };
      const alice = new Person(testCharDef, fakeBrain);

      alice.receiveMessage({ from: "Bob", message: "hi Alice" });
      alice.receiveToken([{ name: "Bob" }], "water cooler", () => {}); // brain returns null, appends [done]
      expect(brainCalls).toEqual(1);

      alice.receiveToken([{ name: "Bob" }], "water cooler", () => {}); // should skip brain
      expect(brainCalls).toEqual(1);
    });

  });

  describe("startWork", () => {
    it("calls brain with empty others and the given location", () => {
      const brain = jasmine.createSpy("brain");
      const alice = new Person(testCharDef, brain);
      alice.startWork("cubicle");
      expect(brain).toHaveBeenCalledWith(jasmine.objectContaining({
        others: [],
        location: "cubicle",
      }));
    });

    it("records brain output in chat when working at cubicle", () => {
      const brain = jasmine
        .createSpy("brain")
        .and.returnValue({ to: [], message: "Reading the backlog" });
      const alice = new Person(testCharDef, brain);
      alice.startWork("cubicle");
      expect(alice.chat).toEqual([
        { from: "Alice", message: "Reading the backlog" },
      ]);
    });

    it("emits worked event with brain output when working at cubicle", () => {
      const brain = jasmine
        .createSpy("brain")
        .and.returnValue({ to: [], message: "Reading the backlog" });
      const alice = new Person(testCharDef, brain);
      const worked = [];
      alice.on("worked", (e) => worked.push(e));
      alice.startWork("cubicle");
      expect(worked).toEqual([
        { name: "Alice", location: "cubicle", message: "Reading the backlog" },
      ]);
    });
  });

  describe("reflection", () => {
    it("fires reflector with chat snapshot when leaving a location", () => {
      const reflected = [];
      const reflector = jasmine.createSpy("reflector").and.returnValue(Promise.resolve());
      const alice = new Person(testCharDef, null, { reflector });

      alice.tick(new Time(9, 0)); // arrive at water cooler
      alice.receiveMessage({ from: "Bob", message: "hi Alice" });
      alice.tick(new Time(12, 0)); // leave water cooler

      expect(reflector).toHaveBeenCalledWith({
        name: "Alice",
        chat: [{ from: "Bob", message: "hi Alice" }],
      });
    });

    it("passes a snapshot of chat before clearing it", () => {
      let capturedChat;
      const reflector = jasmine.createSpy("reflector").and.callFake(({ chat }) => {
        capturedChat = chat;
        return Promise.resolve();
      });
      const alice = new Person(testCharDef, null, { reflector });

      alice.tick(new Time(9, 0));
      alice.receiveMessage({ from: "Bob", message: "hi" });
      alice.tick(new Time(12, 0)); // triggers reflection, then clears chat

      expect(capturedChat).toEqual([{ from: "Bob", message: "hi" }]);
      expect(alice.chat).toEqual([]); // chat is cleared after
    });

    it("does not fire reflector when chat is empty on departure", () => {
      const reflector = jasmine.createSpy("reflector");
      const alice = new Person(testCharDef, null, { reflector });

      alice.tick(new Time(9, 0));
      alice.tick(new Time(12, 0)); // no messages exchanged

      expect(reflector).not.toHaveBeenCalled();
    });

    it("does not fire reflector when no reflector is configured", () => {
      const alice = new Person(testCharDef);

      alice.tick(new Time(9, 0));
      alice.receiveMessage({ from: "Bob", message: "hi" });

      expect(() => alice.tick(new Time(12, 0))).not.toThrow();
    });
  });
});
