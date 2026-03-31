## Why

The current **Cleanup** uses a fixed **two-column** layout (all **Processes** left, all **Files** right). That is easy to implement but often misreads pipeline **flow**: real diagrams read better as an alternating **Process → File → Process → …** strip when the topology allows, with **layers** driven by **connectivity** rather than partition alone. Users also lose **manual layout** when they save and reopen: exported v2 JSON today carries no **coordinates**, so the canvas “snaps” to algorithmic defaults on load.

## What Changes

- **Cleanup**: Replace the fixed two-column rule with a **layered, left-to-right** layout that is **primarily driven by the link structure** (connectivity / dependency-style ordering), not by “all of one type, then all of the other.” The layout SHALL **alternate type by column** (**Process, File, Process, File, …**) **where the graph structure permits**; where it does not (e.g. branching, shared artifacts, cycles), the algorithm MAY use **additional columns** or **rows** so bipartite constraints and readability still hold.
- **Explicit acceptance** (see spec): For a **minimal chain** (**two Processes**, **one File**, both linked to that File, nothing else), **Cleanup** MUST lay out as **Process → File → Process** along x (File **between** the two Processes), **not** as the legacy pattern **all Processes in one column and all Files in another**.
- **Cleanup invariants**: **Cleanup** MUST change **only** positions (and zoom/view state if applicable). It MUST **not** modify Process or File **entities** or **links**—only coordinates.
- **Layout quality**: When **multiple** valid layouts exist, the implementation SHOULD prefer arrangements that **reduce line crossings** and keep **neighbors visually close** (within practical, local-only performance limits—**no** requirement for a globally optimal crossing number).
- **Persistence**: **Save / Export** MUST include **`x` and `y` on every Process and every File**. **Load** of that file MUST restore the **same layout**. When coordinates are absent (legacy files), the app MAY fall back to documented placement rules.

**Non-goals:** server sync, collaborative editing, general graph daggers for non-bipartite graphs, or guaranteed minimum-crossing optimality.

## Capabilities

### Modified Capabilities

- `mini-pipeline-bipartite-v1`: **Cleanup** behavior, **v2 JSON** shape (optional stored coordinates), **export/load** round-trip for layout.

## Impact

- **Code**: `mini-pipeline/graph-geometry.js` (or successor layout module), `app.js` position maps, `bipartite-rules.mjs` / `export-v2.mjs` validation and serialization, tests, `README.md`, possibly `sample-pipeline.json`.
- **Compatibility**: v2 files **without** coordinates remain valid; v2 files **with** coordinates become the canonical way to preserve manual layout.
