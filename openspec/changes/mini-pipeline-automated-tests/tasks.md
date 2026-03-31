## 1. Test infrastructure

- [x] 1.1 Add stable **`data-testid="main-controls"`** and **`data-testid="graph-controls"`** wrappers in `index.html` around the two regions (during same apply as tests)
- [x] 1.2 Ensure **`npm test`** runs plain **`node --test tests/*.mjs`** with **no** new build step
- [x] 1.3 _(Optional)_ Add **`tests/browser-smoke.html`** (vanilla JS only) for manual open-in-browser checks—**no** npm packages for that file

## 2. Layout contract tests

- [x] 2.1 Add `tests/ui-layout.test.mjs`: read `index.html`, assert main region contains ids/controls for Process/File create, link, load sample, load file, save, and edit/inspector wiring
- [x] 2.2 Assert graph region contains Reset zoom + Cleanup and **lacks** save/load/link/process/file create controls (per whitelist of forbidden substrings or button ids)

## 3. Graph behaviour tests

- [x] 3.1 Extend or add tests for **Cleanup** structural equality + left-right position rule using `graph-geometry.js` / `bipartite-rules.mjs`
- [x] 3.2 Keep or add **invalid connection** and **drag model / positions + links** tests (`bipartite-acceptance` or new file)

## 4. Export tests

- [x] 4.1 Extract or duplicate a **pure** `buildV2Export(state)` used by app and tests; assert golden fixture passes `validateV2Payload`

## 5. Documentation

- [x] 5.1 Document test scope and “no external services” in `mini-pipeline/README.md`
