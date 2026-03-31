## Context

Mini Pipeline Diagram Maker v1 is a static `mini-pipeline/` app with in-memory graph state, SVG rendering, and toolbar buttons for **Delete selected node** / **Delete selected edge**. This change adds **zoom** and **keyboard deletion** while staying bundle-free and serverless.

## Goals / Non-Goals

**Goals:**

- **Ctrl + wheel** (with **meta** on macOS optional alignment with “Control” — see decisions) zooms the graph viewport.
- Zoom **anchors to cursor** inside the graph area where the browser exposes reliable coordinates (clientX/Y relative to SVG or scroll container).
- **Delete** and **Backspace** remove the **current selection** (node takes precedence if both are somehow selected — implementation should enforce mutual exclusion as today).
- Update **README** with zoom and keyboard hints.

**Non-Goals:**

- Panning canvas, minimap, pinch-zoom on trackpad as a first-class spec (unless free with the same handler).
- Undo/redo, server save, URL state.
- Zoom persistence across reloads.

## Decisions

1. **Zoom implementation: adjust SVG `viewBox`** (or a wrapper `<g transform="...">`) rather than browser zoom on the whole page.  
   **Rationale:** Keeps UI chrome readable; matches diagram tools. **Alternative:** CSS `transform` on inner SVG group — acceptable if simpler.

2. **Pointer-centered zoom:** On wheel, compute focal point in **SVG user space** before zoom, scale `viewBox` width/height, then translate `viewBox` so the focal point stays under the cursor. Clamp zoom to min/max factors (e.g. 0.25×–4×).

3. **Keyboard shortcuts:** `keydown` on `window` or graph container; ignore when focus is in `<input>`, `<textarea>`, or `<select>` so typing is not swallowed.

4. **“Control + wheel” on macOS:** Browsers often use **ctrl+wheel** for zoom; **cmd+wheel** may scroll. Spec text will require **Control** + wheel; optionally support **meta** + wheel for macOS parity **only if** it does not fight browser defaults — document in tasks if skipped.

5. **Deletion UX:** Retain existing buttons; add keyboard parity. No confirmation modal for v1 (consistent with current delete behavior).

## Risks / Trade-offs

- **[Risk] Browser captures ctrl+wheel** → **Mitigation:** Listen on graph surface with `preventDefault()` when modifier matches; test Chrome/Firefox/Safari.
- **[Risk] Focus in form fields** → **Mitigation:** Short-circuit keyboard delete when `event.target` is form control.

## Migration Plan

- Ship as incremental update to `mini-pipeline/`; no data migration.

## Open Questions

- Whether to add a **Reset zoom** button in toolbar (helpful; can land in tasks as optional polish).
