# Mini Pipeline Diagram Maker (bipartite v2)

Single-page, **browser-only** tool: **Processes** (circles) and **Files** (rectangles) in a **bipartite** graph — links only go **Process ↔ File**. Lines update while you **drag** shapes. **Cleanup** recomputes positions using a **layered, left-to-right** layout from **link connectivity** (alternating Process → File → Process along chains where possible); it does **not** change Processes, Files, or links. No execution, login, database, or cloud.

## Run locally

```bash
cd mini-pipeline
python3 -m http.server 8080
```

Open `http://localhost:8080`. The app uses **ES modules** (`app.js` imports `bipartite-rules.mjs` and `export-v2.mjs`); use a static server, not only `file://`, for reliable loading.

## UI layout

- **Main controls** (above the workspace): add Process/File, link pickers, delete selection, **Load sample**, **Load JSON file…**, **Save / Export JSON…**, and status text. All editing and I/O for the diagram live here.
- **Graph controls** (next to the graph): **Reset zoom** and **Cleanup** only — focused on the canvas view.

**Save / Export** downloads `mini-pipeline.json` locally via the browser (Blob + download). Nothing is uploaded. Exports include **`x` and `y`** for every Process and File so reopening restores the same layout.

## JSON format (version 2 only)

Version **1** (`nodes` / `edges`) is **not supported** — you will see an error asking for v2.

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Must be `2` |
| `processes` | array | `{ id`, `label`, optional `detail`, optional `x`, `y` } |
| `files` | array | `{ id`, `label`, optional `detail`, optional `x`, `y` } |
| `links` | array | `{ processId`, `fileId`, optional `id` }` — each link connects one Process to one File |

Ids must be **globally unique** across processes and files. **`x` / `y`** are optional for legacy files; if **any** entity includes layout, **every** Process and File **must** include finite **`x`** and **`y`**. Example: `sample-pipeline.json` (no stored coordinates — **Cleanup** runs on load).

## Features

- Add **Process** / **File**, **Add link** (Process + File pickers — same-partition links are rejected with a message).
- **Drag** Processes and Files; lines stay attached to shape edges.
- Select a Process, File, or **link**; **Delete** / **Backspace** or **Delete selection**.
- **Cleanup** — connectivity-based layered layout (not a single “all Processes | all Files” pair of columns); graph **data** unchanged.
- **Reset zoom** — fits **Processes**, **Files**, and **link lines** in the canvas with a **margin**; changes **only** the viewport, not positions.
- **Ctrl + scroll** on the canvas to zoom (viewport).
- **Load sample** / **Load JSON file…** / **Save / Export JSON…** (local file only; saved files restore positions).

## Automated checks

```bash
cd mini-pipeline
npm test
```

Tests use **`node --test`** only — no separate build step and **no external services**. Scope:

- `tests/graph-geometry.test.mjs` — layout helpers (`graph-geometry.js`), including P–F–P **Cleanup** acceptance
- `tests/bipartite-acceptance.test.mjs` — validation rules (`bipartite-rules.mjs`), optional coordinates on load
- `tests/export-v2.test.mjs` — v2 export with `x`/`y` (`export-v2.mjs`)
- `tests/ui-layout.test.mjs` — `index.html` main vs graph control regions
- `tests/view-fit.test.mjs` — Reset-zoom viewport fit (`view-fit.mjs`)

Optional manual list: open `tests/browser-smoke.html` in a browser for a short checklist (vanilla HTML, no npm deps).
