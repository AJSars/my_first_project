## Why

Pipelines are often clearer when **work steps (processes)** and **artifacts (files)** are first-class objects: a **bipartite** view prevents ambiguous step-to-step links and matches how people think about what produces what. Dragging items to arrange the canvas and a **Cleanup** layout complement zoom so the same single-page, local tool stays usable as diagrams grow.

## What Changes

- **Terminology & shapes**: **Processes** (replace “nodes”) drawn as **circles**. **Files** (replace “edges” as link objects) drawn as **rectangles** representing file or asset names/types.
- **Graph model**: **Bipartite only**. A connection always links one **Process** to one **File** (undirected logical link for data; rendered as line segments from shape to shape). **Process–Process** and **File–File** links are **forbidden** in the UI and **rejected** in any imported data.
- **Connections**: Lines run **between** a Process shape and a File shape; line geometry updates **during** drag and **after** pointer release.
- **Interaction**: **Drag** Processes and Files to reposition manually; persistent positions remain the source of truth except when **Cleanup** or full diagram load runs.
- **Toolbar**: Keep **Reset zoom**; add **Cleanup** to run an automatic layout that improves clarity (e.g. bipartite two-column layout with spacing) without leaving the page.
- **Imports**: **JSON version 2** with `processes`, `files`, and `links` as `(processId, fileId)` pairs; **version 1** data SHALL be rejected with a clear message unless an optional migrator is implemented in the apply phase.

**Non-goals:** backend, database, auth, cloud, external integrations (unchanged).

## Capabilities

### New Capabilities

- `mini-pipeline-bipartite-v1`: Bipartite Process/File model, UI vocabulary, circles vs rectangles, connection rules, drag repositioning, live line updates, Cleanup layout, v2 JSON shape, zoom/Reset zoom parity.

### Modified Capabilities

- `mini-pipeline-diagram-v1`: **Superseded** by `mini-pipeline-bipartite-v1` for this product direction; prior node/edge scenarios do not apply after this change is applied.

## Impact

- **Code**: `mini-pipeline/` — major refactor of `app.js`, `graph-geometry.js`, `index.html`, `styles.css`, `sample-pipeline.json`, tests, `README.md`.
- **Breaking**: Graph JSON **v1** (`nodes` / `edges`) **no longer** accepted unless a separate migration task is completed.
