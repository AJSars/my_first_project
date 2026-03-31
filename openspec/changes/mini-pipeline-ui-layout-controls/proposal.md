## Why

Power users need **spatial separation** between “data entry” (building the bipartite model) and “canvas ergonomics” (zoom, layout). Placing **Reset zoom** and **Cleanup** **next to the graph** reduces travel distance and clarifies intent. A **one-click save** rounds out the local workflow without implying any server or cloud.

## What Changes

- **Main controls section**: A dedicated, clearly labeled region that **isolates** **Process/File creation**, **editing** (e.g. inspector and any label/detail controls tied to selection), **linking**, **loading** (sample + file pick), and **saving**—all diagram “model” work stays in this band.
- **Graph controls section**: A **separate** strip or panel **near the graph canvas** with **only** canvas-oriented actions: **Reset zoom** and **Cleanup**. **Cleanup** still improves **left-to-right** clarity **without** changing underlying graph data (Processes, Files, links); only layout positions / view fit.
- **Save / export**: One action that downloads the **current graph** as a **local JSON file** (`version: 2`, same shape as load)—**browser-only** (Blob / download link), **single page**, **no** backend, **no** database, **no** cloud.

## Capabilities

### New Capabilities

- _(none — UI/save extends the existing app spec)_

### Modified Capabilities

- `mini-pipeline-bipartite-v1`: Add requirements for **two-region UX** (main vs graph-adjacent controls) and **local JSON export**; reaffirm Cleanup data invariants and left-to-right layout goal.

## Impact

- **Code**: `mini-pipeline/index.html`, `styles.css`, `app.js` (layout + local JSON file export); optional `README.md` touch-up.
- **Breaking**: None for JSON v2 schema; **additive** UI and export only.

## Constraints (inherited)

- **Single-page**, **local-only** app: no new server, database, or cloud dependencies for these features.
