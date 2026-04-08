# Long-Lived Office Simulation Design

## Vision

The simulated company builds real software. Characters retrieve work from a shared backlog, define changes, build them, and ship them over multiple simulated "days." Each person has their part to play based on their role.

## Example: 3-Day Scenario

Issue: [elevator-saga-2#18 - Headless sandbox mode](https://github.com/tdurtschi/elevator-saga-2/issues/18)

**Day 1 - Planning:**
Alice (PM) pulls the issue from the backlog during solo time. Reads it, notices the dependency on #17. In the next meeting with Jim, her agenda is: "what's the status of #17, and can we start scoping #18?" They discuss, Jim reads the codebase to assess feasibility. They leave the meeting with a rough plan.

**Day 2 - Design:**
Yoder looks at the issue from a UX angle during solo time - what should the config look like, what metrics matter to users. Brings proposals to the next face-to-face. Alice prioritizes. Jim identifies the technical approach.

**Day 3+ - Build:**
Jim works solo at his cubicle, CLI brain active, actually writing code against the repo. Hits a question about requirements, notes it for the next meeting with Alice. Alice reviews his PR during her solo time.

## Key Design Changes

### 1. Per-Character Memory (foundational - everything else depends on this)

Each person has their own persisted memory. Context from conversations and solo work carries forward across locations and days. Without this, nothing else works - characters can't build on prior conversations or track their own work.

### 2. Context-Dependent Brains

Brain is no longer a fixed property of a Person. Instead, the active brain depends on what the character is doing:

- **Conversation brain** (LLM) - lightweight, for meetings and hallway chats
- **Solo brain** (LLM or CLI) - for deep work at the cubicle: writing code, specs, reviewing PRs
- **Planning brain** - looks at the backlog, decides what to work on next
- **Reflection brain** - summarizes the day, updates own memory

Selection driven by context: Am I alone? In a meeting? What task am I working on?

Shape: instead of `new Person(alice, llmBrain)`, something like `new Person(alice, { conversation: llmBrain, solo: cliBrain, planning: planBrain })`.

### 3. Backlog Integration

Characters can read from and write to GitHub issues. The shared backlog is the source of work. Characters pull tasks, update status, comment with questions or decisions.

### 4. Agenda Formation

Solo brain produces agendas like "I need to talk to Jim about X." These feed the conversation brain so face-to-face time is purposeful, not aimless chatting.

### 5. Work Artifacts

Solo work produces real output:
- Jim: commits, PRs
- Alice: specs, issue comments, prioritization decisions
- Yoder: design proposals, user-facing feedback

### 6. Multi-Day Simulation Loop

The sim runs across "days." End-of-day reflection writes to memory. Start-of-day planning reads from memory and backlog.

## Build Order

1. **Memory** - per-character persistence so context carries forward
2. **Context-dependent brains** - right brain for the right activity
3. **Backlog integration** - real work from GitHub issues
4. **Agenda formation** - purposeful meetings driven by solo work
5. **Multi-day loop** - days, reflection, continuity
