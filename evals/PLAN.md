# Evals

A separate evaluation harness for iterating on the system prompt. Intentionally
not part of `npm test` — these hit a real model and are meant to be run manually
when working on the prompt, not on every change.

## Structure

```
evals/
  run.js            # entry point — runs all scenarios, prints results
  checks.js         # reusable pass/fail checks on response text
  scenarios/        # one file per scenario
    jim-deflects.js
    yoder-at-water-cooler.js
    ...
```

## Concepts

### Scenario

A fixed setup that produces one LLM response. Each scenario exports:

```js
module.exports = {
  label: "Jim is asked about the roadmap",
  character: { ... },  // from characters.js or inline
  name: "Jim",
  location: "water cooler",
  others: [{ name: "Alice" }],
  chat: [
    { from: "Alice", message: "so what's the plan for Q3?" },
  ],
  // minutesRemaining and minutesPerTurn are fixed by the runner (e.g. 60 / 8)
};
```

### Checks

Pure functions `(responseText) => { pass: bool, label: string }`. Examples:

- no asterisks
- no quoted response (starts/ends with `"`)
- under 30 words
- doesn't repeat the previous message verbatim

Checks run automatically and print pass/fail. Failures don't throw — everything
still runs so you can see the full picture.

### Output

```
=== Jim is asked about the roadmap ===
Alice: so what's the plan for Q3?

CHECKS
  ✓ no asterisks
  ✓ no quoted response
  ✗ under 30 words (was 47)

RESPONSE
Ha, Q3 plan? I think the plan is to make it to Q4...

---
```

Subjective quality (character voice, naturalness) is assessed by reading the
RESPONSE section. Criteria will emerge from running it and developing opinions.

## Running

```
node evals/run.js
```

Requires the same env vars as `run.js` (`ANTHROPIC_URL`, `LLM_MODEL`).

## Open questions at time of writing

- Should `run.js` accept a scenario name arg to run a single scenario?
  (Probably yes once the suite grows, not needed to start.)
- What's the right `minutesRemaining` default? 60 seems fine — we're testing
  voice, not timing behavior.
