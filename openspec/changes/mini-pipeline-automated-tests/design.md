## Context

The app is static HTML + ES module `app.js` + `bipartite-rules.mjs` + `graph-geometry.js`. Tests must stay **proportionate** to a small local tool: **no** enterprise JS toolchain.

## Goals / Non-Goals

**Goals (lightweight first):**

1. **Headless / CLI (default)**  
   - **`node --test`** with plain **`tests/*.mjs`** modules.  
   - **Read `index.html` as text** for layout contract checks (substring / regex / cheap slice between `data-testid` boundaries)—**no jsdom** unless absolutely necessary.

2. **Browser (optional smoke)**  
   - A **single** static page (e.g. `tests/browser-smoke.html`) opened **manually** via `file://` or `python -m http.server`, using **vanilla** `<script>` assertions (`console.assert` or a 20-line throw-on-fail helper).  
   - **No** test framework npm package, **no** bundler.

3. **Logic under test**  
   - Keep **`bipartite-rules.mjs`** + **`graph-geometry.js`** (eval in Node as today) for Cleanup, invalid links, export shape.  
   - **`buildV2Export`**: one small pure function in a **`.mjs`** file importable by Node tests (and by `app.js` if desired).

**Non-Goals:**

- Webpack, Rollup, Vite, Babel, TypeScript project for tests.  
- **Jest**, **Vitest**, **Mocha** + heavy plugins.  
- **Playwright**, **Puppeteer**, **Cypress**, **Selenium** as the default for this initiative.  
- **jsdom** + **@testing-library** unless a later change explicitly relaxes this.  
- Visual regression / screenshot services.

## Decisions

1. **Canonical command**: `npm test` → `node --test tests/*.mjs` (already in `package.json` pattern).  
2. **Layout markup**: `data-testid="main-controls"` and `data-testid="graph-controls"` for string-scoping tests.  
3. **Browser file**: If added, it SHALL ship as **static assets only** and SHALL NOT add npm dependencies.

## Risks / Trade-offs

- String-based HTML tests can break on refactor—**mitigation**: stable `data-testid` wrappers and button `id`s.

## Open Questions

- None for v1; reach for Playwright only if product later mandates true cross-browser E2E.
