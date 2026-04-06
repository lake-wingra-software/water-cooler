# Claude Code Guidelines

## Workflow

### TDD

Write tests before writing code. The pattern:

1. Write a failing test that asserts the desired behavior
2. Run it to confirm it fails (red)
3. Write the minimum code to make it pass (green)
4. Consider and apply refactors while the suite stays green
5. Run the full test suite — all tests must pass before committing
6. Commit

**For behavioral/integration changes:** write executable specs that verify system behavior.
**For logic/pure function changes:** write unit tests.

Tests also serve as regression guards during refactors — write characterization tests first if the behavior isn't already covered.

### Committing

Commit after each logical unit of work (e.g. one feature + its test). Keep commits small and focused.

### Interactive workflow

Use this workflow by default, or whenever the user asks to pair or code together.

**Exploration phase** (Navigator/Driver):

- Claude navigates — pointing to files, explaining what it sees, suggesting where to look next.
- The human drives — running commands, reading code, asking questions.
- Exit when you've agreed on the next behavior to build.

**TDD phase** (follow the TDD pattern above, with human sign-off at each step):

- Agree on the test before Claude writes it.
- Agree on the implementation approach before Claude writes it.
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

## Executable Specs

Build specs that can be run to verify system behavior. These serve as both documentation and regression guards.

- Write specs before implementation
- Specs should assert on observable behavior, not internals
- Keep specs focused and readable
- Run specs as part of the standard test suite

## General Principles

- Keep changes focused and incremental
- Prefer small, reviewable commits
- Use specs/tests as your safety net for refactoring
