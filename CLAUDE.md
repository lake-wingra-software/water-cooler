# Claude Code Guidelines

## Values

- **Confidence** — trust the test suite. Green means ship. Red means stop.
- **Understanding** — tests document the behavior that demanded the code. No code without a reason.
- **Simplicity** — minimum code that passes the test. No speculation, no "just in case."
- **Shippability** — every commit leaves the codebase working. Always releasable.
- **Maintainability** — code stays understandable over time without things that rot.
- **Structure** — separate structural changes from behavior changes. Tidy the code first, then change the behavior. Each in its own commit.
- **Feedback** — learn and improve through fast, honest signals.

## Principles

- Test-drive everything — failing test first, then code, then refactor.
- Work outside-in — start from user-visible behavior, discover internals as needed.
- Small increments — one concern per commit. Structure commits and behavior commits are separate. Each commit green and shippable.
- Real collaborators over mocks where practical (classicist TDD) — tests that survive refactoring.
- Tests are documentation — flaky or failing tests are serious problems, not noise.
- Fix root causes — don't patch symptoms, don't skip tests, don't ignore failures.
- The red step requires the test to fail for the right reason — a test failing due to a missing import or syntax error hasn't proven it can catch the real failure. The assertion itself must fail before proceeding.
- A failing test means understanding and reality are misaligned — stop and fix before moving on.
- A flaky test erodes trust in the suite — treat it as a real problem.
- Tidy first — when a story needs structural change, do it in a separate commit before the behavior change. Both commits green.
- Name refactorings — be specific about what you're doing. "Extract this into a method" not "clean this up." Specific enough that the other person can agree or disagree.
- Catalog, don't expand — when you notice improvements outside the story, name them and propose them. Don't implement without agreement.
- Eliminate surprise before explaining it — if code needs a comment to explain what it does, refactor. Comments are a last resort for why when the cause is outside our control.
- Shorten feedback loops — TDD, small commits, say what's working and what isn't, retro before wrapping a session.

## Workflow

### TDD

Write tests before writing code. The pattern:

1. Write **one** failing test that asserts the desired behavior
2. Run it to confirm the **assertion** fails (red) — not just an import or syntax error. Stub the module first if needed so the test actually runs.
3. Write the minimum code to make it pass (green)
4. Repeat 1–3 for the next behavior — one test at a time, not a batch
5. Consider and apply refactors while the suite stays green
6. Run the full test suite — all tests must pass before committing
7. Commit

**For behavioral/integration changes:** write executable specs that verify system behavior.
**For logic/pure function changes:** write unit tests.

Tests also serve as regression guards during refactors — write characterization tests first if the behavior isn't already covered.

### Interactive workflow

Use this workflow by default, or whenever the user asks to pair or code together.

**Exploration phase** (Navigator/Driver):

- Claude navigates — pointing to files, explaining what it sees, suggesting where to look next.
- The human drives — running commands, reading code, asking questions.
- Exit when you've agreed on the next behavior to build.

**Tidy phase** (before behavior changes):

- Agree on what structural changes the story needs.
- Claude proposes tidy-first commits, naming each structural change specifically.
- Human approves. Commit green.
- Then proceed to TDD for the behavior change.

**TDD phase** (with human sign-off at each step):

- Agree on the test before Claude writes it.
- Claude writes the failing test — the assertion must fail, not just a syntax or import error.
- Agree on the implementation approach before Claude writes it.
- Claude writes the minimum code to make it pass.
- Nothing moves forward without the human's sign-off.

**Refactor phase**:

- Either party can propose refactors.
- Claude writes the changes.
- The human approves before committing.

**Why:** Core principle is "Claude writes everything, the human owns every decision."
**How to apply:** Use this style whenever pairing on implementation work, unless the human says otherwise.

### GitHub PR workflow

Use this workflow whenever the user asks you to use PRs or work unsupervised.
Always work on a feature branch — never commit directly to `master`. Before starting any work:

1. Create a branch: `git checkout -b fix/<issue-number>-short-description` or `feat/<issue-number>-short-description`
2. Do the work and commit on that branch
3. Run the full test suite — all tests must pass before opening a PR
4. Push the branch and open a PR targeting `master`, linking the relevant issue

Note: When running this workflow, take care to avoid getting stuck. It is preferable to provide an update or ask a question directly in the github issue and exit.

### Committing

Commit after each logical unit of work. Keep commits small and focused — structure commits and behavior commits are separate.

## Executable Specs

Build specs that can be run to verify system behavior. These serve as both documentation and regression guards.

- Write specs before implementation
- Specs should assert on observable behavior, not internals
- Keep specs focused and readable
- Run specs as part of the standard test suite
