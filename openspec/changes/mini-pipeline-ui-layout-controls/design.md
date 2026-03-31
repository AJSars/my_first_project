## Context

Mini Pipeline Diagram Maker is bipartite v2: Processes, Files, links, drag, Cleanup, Reset zoom, load sample/file. This change is **layout and IA** plus exporting the current graph as a **local JSON file**, while keeping the app **single-page** and **local-only**.

## Goals / Non-Goals

**Goals:**

- **Main controls** `<section>` (or equivalent) grouping: create Process/File, link controls, delete/selection-related toolbar rows if they stay “model” oriented, **Load sample**, **Load JSON**, **Save / Download diagram** (v2 JSON).
- **Graph controls** `<section>` placed in the **workspace** next to the canvas (e.g. above or beside the SVG), containing **Reset zoom** and **Cleanup** only (or strictly “canvas” actions).
- **Save**: Builds a `version: 2` object matching load semantics (`processes`, `files`, `links`, optional `detail`), triggers browser download with a sensible default filename (e.g. `diagram.json` or timestamped).
- **Cleanup**: Reuse or refine existing algorithm; emphasize **left-to-right** readability (Processes left, Files right already satisfies); document that **graph data** (ids, labels, link multiset) is unchanged.

**Non-Goals:**

- Backend, sync, auth, cloud storage, or automatic remote backup.
- Changing the v2 **on-disk** schema except as needed to round-trip save/load (no new required fields).

## Decisions

1. **Mark up**: Use semantic `<section aria-label="…">` for “Main controls” and “Graph controls” so structure is obvious in DOM and to AT.
2. **Save implementation**: `JSON.stringify` pretty-print optional (`2` space indent); `Blob` + temporary `<a download>` or `URL.createObjectURL`; revoke URL after click.
3. **Editing**: If “editing” is inspector-only today, keep it in main controls column or inspector aside—**design: main column** includes any forms that edit selection (future-safe).
4. **Responsive**: Stack graph controls above canvas on narrow widths; keep both sections visible without horizontal scroll where possible.

## Risks / Trade-offs

- **Duplicate actions** if old buttons linger—**mitigation**: move Reset/Cleanup only into graph region, remove from main toolbar.

## Migration Plan

- None; visual reorder + new save button.

## Open Questions

- Filename pattern: fixed `mini-pipeline-diagram.json` vs `diagram-YYYY-MM-DD.json`—pick one in implementation (tasks).
