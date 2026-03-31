## Why

Regression risk grows as the bipartite UI splits **main** vs **graph** controls and adds **save**. **Automated checks** catch drift in layout markup, graph rules, Cleanup invariants, and export shape—without relying on manual clicks for every release.

## What Changes

- Add a **local-only** automated test suite (no remote services, no CI vendor requirement) that validates:
  - **UI layout**: **Main controls** region exposes **create**, **edit**, **link**, **load**, and **save**; **graph controls** region exposes **Reset zoom** and **Cleanup** only (no duplicate model I/O there).
  - **Graph behaviour**: **Cleanup** improves **left-to-right** layout **without** changing Processes, Files, or links; **invalid connections** rejected; **drag** preserves link attachment at the model level; **save** produces **correct v2 JSON** for the current state.
- Use a **lightweight** approach suitable for a **small static app**: **`node --test`** and plain **`*.mjs`** files as the default (no bundler, no transpiler). **Optional**: a tiny **`test-runner.html`** you open locally in a browser for DOM smoke checks using **vanilla JS** only. **Do not** introduce complex build pipelines, Jest/Vitest-style stacks, Playwright/Cypress, or other **heavy** dependencies for this workstream—**no** paid SaaS, browser farm, or mandatory cloud.

## Capabilities

### New Capabilities

- `mini-pipeline-automated-tests`: Normative expectations for the repository’s automated test coverage of layout and graph behaviour (what MUST be asserted).

### Modified Capabilities

- _(none — complements `mini-pipeline-bipartite-v1` and UI layout change)_

## Impact

- **Code**: `mini-pipeline/tests/**`, small **test helpers** or **exported pure functions** in app if required to avoid duplication; `package.json` **test** script; `README` test section.
- **Dependencies**: **Zero** new npm dependencies preferred; **no** new build tools. If a one-file browser harness is added, it SHALL be plain script tags only.
