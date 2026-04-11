# water-cooler

An office simulation where AI-powered characters follow schedules, move between shared locations, and have conversations.

The simulation runs a single workday (9am–5pm). Characters follow a schedule, moving between shared locations — the `conference room`, `water cooler`, and `cafeteria`. When two characters end up at the same place, they strike up a conversation: they greet each other, then take turns speaking while everyone present listens.

## Requirements

- [Node.js](https://nodejs.org/)
- [GitHub CLI (`gh`)](https://cli.github.com/)
- [Claude Code CLI (`claude`)](https://docs.anthropic.com/en/docs/claude-code) — used by the CLI brain to spawn `claude -p` subprocesses
- An `ANTHROPIC_API_KEY` from [Anthropic](https://console.anthropic.com/) — used by both the LLM brain (API calls) and the CLI brain

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
TICKS_PER_SEC=1    # 1 sim-minute/sec — full day takes 8 minutes real time
TICKS_PER_SEC=8    # default — full day takes ~60 seconds
TICKS_PER_SEC=60   # 1 sim-hour/sec — full day takes ~8 seconds
```

### Model

Set `LLM_MODEL` in `.env` to change the model used by the LLM brain. The CLI brain uses the same model via the `--model` flag passed to `claude`.

## Dev harness

`harness.js` runs a single character (or a two-character meeting) in isolation, without spinning up the full workday. Use it to iterate quickly on prompts, tools, memory, and character behavior.

> **Run outside Claude Code.** The harness spawns `claude -p` under the hood, which refuses to launch inside another Claude Code session. Use a plain terminal.

### Cubicle mode

Runs a single cubicle work session for one character against their real memory. Diffs their workspace directory before and after and prints any new or changed files.

```sh
node harness.js jim
```

Output:

```
Character: Jim
Workspace: /path/to/water-cooler/workspaces/jim
Tools:     Read, Grep, Glob, Edit, Write, Bash(gh:*), Bash(npm test:*)

Running cubicle work session...

--- Brain output ---
Done. I've drafted the initial recommendation as `team-roles-recommendation.md`...

--- Workspace changes ---
+ team-roles-recommendation.md
```

### Meeting mode

Places two characters at a shared location and runs a short exchange between them. Useful for probing chat-brain behavior, greetings, turn-taking, and (eventually) artifact sharing.

```sh
node harness.js jim --location "conference room" --with alice --turns 4
```

- `--location <loc>` — any public location (`conference room`, `water cooler`, `cafeteria`)
- `--with <other>` — the other character to put in the room
- `--turns N` — how many turns to run (default 4)

Speaker order is deterministic (arrival order), not randomized like the full sim, so runs are reproducible.

Each turn has a 60-second timeout — if a character hits `[done]` and returns nothing, the harness moves on instead of hanging.

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
