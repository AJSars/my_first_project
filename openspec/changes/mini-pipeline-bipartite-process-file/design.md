## Context Today

The app uses v1 JSON (`nodes`, `edges` as directed step-to-step edges with labels) and layers edges as Bézier curves between circular nodes. This change **replaces** that mental model with a **bipartite** graph: Processes and Files as two partitions, links only across partitions.

## Goals / Non-Goals

**Goals:**

- **Data model**: Collections `processes[]`, `files[]`, `links[]` where each link references `{ processId, fileId }` (or equivalent). Validate on load and in UI: **no** link with both endpoints in the same partition.
- **Rendering**: Circles (Processes), rectangles (Files), straight or simply routed **polylines** or line segments from perimeter to perimeter (v1 of routing: line from nearest boundary point or center-to-center acceptable if documented).
- **Drag**: Pointer capture / `mousemove` → update entity position, recompute incident segment endpoints each frame.
- **Cleanup**: Deterministic algorithm, e.g. **bipartite two-column** (Processes left, Files right) or layered by link distance, with collision padding; assign new coordinates to **all** entities (or only non-pinned — no pins in v1; all move on Cleanup).

**Non-Goals:**

- Edge routing with obstacles, labels, or bundles.
- Undo/redo, persistence beyond in-memory + file JSON.
- Migrating v1 JSON automatically (optional task; default: reject with message and ship **v2** `sample-pipeline.json`).

## Decisions

1. **JSON v2 shape** (normative for spec):

   ```json
   {
     "version": 2,
     "processes": [{ "id": "string", "label": "string", "detail": "string (optional)" }],
     "files": [{ "id": "string", "label": "string", "detail": "string (optional)" }],
     "links": [{ "id": "string (optional)", "processId": "string", "fileId": "string" }]
   }
   ```

   **Rationale**: Explicit bipartite types; `label` on a file holds the former “edge label” meaning (asset name/type).

2. **Connections**: Store **undirected** logical link; render one line. Duplicate `(processId, fileId)` pairs rejected.

3. **Drag implementation**: Store `(x, y)` per process and per file in a shared `positions` map (ids namespaced or type-prefixed if id collision risk — design: enforce **unique ids across both sets** in validator).

4. **Hit testing**: Drag starts on mouse down on shape; ignore when target is connection line (optional: lines non-draggable).

5. **Cleanup**: `Cleanup` clears `userAdjusted` layout flag if using viewBox fit pattern; runs `layoutBipartiteCleanup(processes, files, links)` → overwrites positions for all ids.

6. **Rename UI strings**: “Add process”, “Add file”, “Connect process to file”, “Delete selected …”, inspector titles, README.

## Risks / Trade-offs

- **Drag + zoom**: Positions in SVG user space; transform viewBox consistently (reuse current zoom stack).
- **Large diagrams**: Two-column Cleanup may need vertical packing — use `ROW_H` spacing.

## Migration Plan

- Replace sample with v2; README documents v2 only; v1 returns validation error with one-line hint.

## Open Questions

- Optional **v1 → v2** migration tool (treat each old edge as a File entity) — defer to tasks as stretch.
