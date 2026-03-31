## 1. Zoom

- [x] 1.1 Implement **Control** + wheel zoom on the graph surface with sensible min/max scale; call `preventDefault` where needed so the browser does not steal the gesture
- [x] 1.2 Implement **pointer-centered** zoom (adjust viewBox or group transform using pointer SVG coordinates) or document in code comments why a simpler center-zoom is used
- [x] 1.3 Verify zoom does not break node/edge hit-testing and selection after rescale

## 2. Deletion UX

- [x] 2.1 Ensure toolbar **Delete selected node** and **Delete selected edge** remain visible and wired as today (copy updated if labels change)
- [x] 2.2 Add **Delete** / **Backspace** handlers that mirror the same logic when a node or edge is selected and focus is not in an input, textarea, or select
- [x] 2.3 Resolve selection precedence if both could ever be active (prefer matching current mutual-exclusion behavior)

## 3. Docs and polish

- [x] 3.1 Update `mini-pipeline/README.md` with zoom (Control + wheel) and keyboard delete
- [x] 3.2 Optional: add **Reset zoom** control in the toolbar if quick to implement
