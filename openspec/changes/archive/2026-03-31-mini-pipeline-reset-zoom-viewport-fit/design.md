## Context

- The graph uses SVG **`viewBox`** (`graphView.x`, `graphView.y`, `graphView.w`, `graphView.h`) plus **`userAdjusted`** to distinguish user zoom/pan from auto fit.
- **Process** geometry: top-left `(x,y)` with circle radius `NODE_R` (see `graph-geometry.js` / `app.js`).
- **File** geometry: rectangle `(x,y, FILE_W, FILE_H)`.

## Goals

1. **Fit-to-bounds**: On **Reset zoom**, derive a bounding region from all placed entities (full circle and rect extents) **and** ensure **link segments** (straight lines between shape boundaries, as in `app.js`) are inside the fitted **viewBox**—either by unioning segment endpoints/extrema with the node bbox or by an equivalent guarantee of **no clipping**.
2. Expand by **margin** `m` (suggest reusing or relating to `PAD` / ~24–48 user units) so **empty padding** is **visible** around the graph on all sides.
3. Set `viewBox` to enclose that region with positive width/height (clamp min size for degenerate cases).
4. **Empty graph**: no coordinates to bound → `userAdjusted = false` and default viewport (e.g. `400×300` user space).
5. **Invariant**: no writes to `state.processes`, `state.files`, `state.links`, `posProcess`, `posFile`, or link/process/file identity—**positions unchanged**.

**Explicit acceptance** (normative detail in spec): after **Reset zoom**, Processes, Files, and **connections** are fully visible (no clipping), **margin** is visible, **positions** unchanged.

## Non-Goals

- Changing how **Ctrl+scroll** zoom works beyond consistency with the new reset baseline.
- Fitting only a subgraph.

## Implementation Notes

- Reuse **`computeBoundsBipartite`** or a thin **`fitBoundsToViewport`** helper that takes position maps + constants (`NODE_R`, `FILE_W`, `FILE_H`) so **Node tests** can run without a browser.
- After reset, **`userAdjusted`** SHOULD be `false` so a subsequent render can keep the fitted view until the user zooms again (align with current flag semantics).

## Risks

- Very large diagrams: viewBox becomes huge; still valid SVG. Scroll/container behavior unchanged by this spec.

## Open Questions

- None for proposal; margin choice lands in `/opsx:apply`.
