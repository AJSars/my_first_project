## Why

As diagrams grow, users need to **see more detail** without leaving the single page, and to **remove mistakes quickly** from whatever is selected. Toolbar actions exist today for deleting nodes and edges; this change **extends** the product with **faster deletion paths** and **zoom** so editing and navigation stay comfortable while preserving v1 constraints (local-only, no backend).

## What Changes

- **Deletion from the UI**: Keep (or clarify) visible controls to **delete the selected node** (and its incident edges) and **delete the selected edge**. Add **keyboard shortcuts** (e.g. Delete / Backspace) when focus is on the graph or the page, so removal does not depend only on pointing at small toolbar buttons.
- **Zoom**: **Ctrl** (or **Control**) + **mouse wheel** over the graph zooms in and out. Zoom SHOULD be **centered on the pointer** when technically practical (e.g. via viewBox or transform math); if the environment makes exact pointer-anchored zoom unreliable, document the chosen approach in implementation.
- **Scope guard**: Single-page app, **local-only**, no new **persistence**, **backend**, **auth**, or **integrations**.

## Capabilities

### New Capabilities

- _(none — extension is a delta on the existing app spec)_

### Modified Capabilities

- `mini-pipeline-diagram-v1`: Add normative requirements for **keyboard-accessible deletion** of the current selection and for **Ctrl + wheel zoom** on the graph, without changing the v1 “no cloud / no backend” boundaries.

## Impact

- **Code**: `mini-pipeline/` (`app.js`, possibly `index.html`, `styles.css`, `README.md`).
- **Specs**: Delta under `specs/mini-pipeline-diagram-v1/spec.md` for this change.
- **Systems**: None (client-only).
