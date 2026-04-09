# water-cooler

An office simulation where AI-powered characters follow schedules, move between shared locations, and have conversations.

The simulation runs a single workday (9am–5pm). Characters follow a schedule, moving between shared locations — the `conference room`, `water cooler`, and `cafeteria`. When two characters end up at the same place, they strike up a conversation: they greet each other, then take turns speaking while everyone present listens.

## Setup

```sh
npm install
cp .env.example .env
# edit .env and add your ANTHROPIC_API_KEY
```

## Running

```sh
node run.js
```

Output is a timestamped log of location changes and conversation turns:

```
09:00: Alice at the conference room; Jim at the conference room
09:01: [conference room] Alice: "Hey Jim, what are we working on today?"
09:02: [conference room] Jim: "I've been looking at the auth service..."
```

### Speed

Each tick is one sim-minute. A full 9–5 workday is 480 ticks. `TICKS_PER_SEC` controls how many ticks run per real second:

```sh
TICKS_PER_SEC=0    # instant — all 480 ticks run as fast as possible
TICKS_PER_SEC=1    # 1 sim-minute/sec — full day takes 8 minutes real time
TICKS_PER_SEC=8    # default — full day takes ~60 seconds
TICKS_PER_SEC=60   # 1 sim-hour/sec — full day takes ~8 seconds
```

### Model

Set `LLM_MODEL` in `.env` to change the model used by the LLM brain. The CLI brain uses the same model via the `--model` flag passed to `claude`.

## Brains

Each character is assigned a **brain** — an async function that receives context and returns a message (or null to stay silent).

- **LLM brain** (`llm-brain.js`): calls the Anthropic API. Can discuss and reason, but has no tool access — it says `[done]` when blocked.
- **CLI brain** (`cli-brain.js`): spawns `claude -p` as a subprocess with `Read`, `Grep`, and `Glob` tools. Can actually read code and files to answer questions.
- **Yeah-man** (`yeah-man.js`): always responds with agreement. Useful for testing.

Characters are wired up in `characters.js`. Uncomment entries there to add more people to the sim.

## Character memory

Each character can have a `memory/<name>.md` file. Its contents are injected into that character's system prompt at the start of every conversation, giving them persistent context across turns and sim runs. Edit these files directly to shape what a character "knows."

## Tests

```sh
npm test
```

Uses Jasmine. Tests cover all core modules. The CLI brain tests inject a fake `exec` to avoid spawning real subprocesses.
