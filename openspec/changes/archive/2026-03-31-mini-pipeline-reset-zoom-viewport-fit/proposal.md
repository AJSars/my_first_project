## Why

**Reset zoom** today clears manual zoom state (`userAdjusted`) and falls back to a simple full-diagram viewBox, but it does **not** explicitly frame all **Processes** and **Files** in a bounded box with **padding**, nor does it spell out behavior for an **empty** diagram. Users expect **Reset zoom** to reliably **fit the whole graph** in the visible canvas (with a small margin) after pan/zoom, without touching data or node positions.

## What Changes

- **Reset zoom** SHALL compute a **bounding region** from every **Process** (circle), **File** (rectangle), and **rendered link segments** so that **nothing** (nodes or connections) is **clipped**—all **fully visible** on the canvas.
- It SHALL set **viewport** state (**viewBox** / pan–zoom equivalent) so the whole graph fits with a **visible margin** (positive padding on all sides; size implementation-defined, documented in code/README).
- **Explicit acceptance** (see spec): after **Reset zoom**, Processes, Files, and **connections** are fully visible; margin is visible; **element positions** (`x`/`y`) **do not** change.
- **WHEN** there are **no** Processes and **no** Files, **Reset zoom** SHALL apply a **documented default** viewport.
- **Reset zoom** MUST **not** modify **processes**, **files**, **links**, **selection**, or **layout coordinates**—only **camera / viewport** state.

**Non-goals:** animated transitions, “zoom to selection,” or persisting viewport in saved JSON unless a separate change adds that.

## Capabilities

### Modified Capabilities

- `mini-pipeline-bipartite-v1`: **Reset zoom** framing behavior and viewport-only guarantee.

## Impact

- **Code**: `mini-pipeline/app.js` (viewBox / `graphView` logic), possibly a small helper next to `computeLayout` / `computeBoundsBipartite`; tests (unit or DOM-free pure helper if extracted); `README.md` one-liner.
