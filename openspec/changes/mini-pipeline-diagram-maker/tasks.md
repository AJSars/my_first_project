## 1. Project scaffold

- [x] 1.1 Add `mini-pipeline/` with `index.html`, `styles.css`, and `app.js` (ES modules optional) wired together with a clear page title and layout regions (toolbar, graph canvas, inspection panel)
- [x] 1.2 Add `mini-pipeline/README.md` with how to run locally (e.g. static server) and the v1 JSON schema description

## 2. Graph model and UI controls

- [x] 2.1 Implement in-memory graph state: nodes (`id`, `label`, optional `detail`) and directed edges (`from`, `to`, `label`, optional `id`)
- [x] 2.2 Add controls to create a node (with label input), delete selected node, create edge between two selected or picked nodes, delete selected edge, and edit selected edge label
- [x] 2.3 Ensure deleting a node removes incident edges

## 3. Visualization

- [x] 3.1 Render nodes and labeled directed edges in SVG using the layered left-to-right layout from design (with cycle fallback note if applicable)
- [x] 3.2 Refresh the SVG when the model changes

## 4. Inspection

- [x] 4.1 On node click, show inspection panel with id, label, detail, and lists of incoming/outgoing edges with labels
- [x] 4.2 Support changing selection and a sensible empty state when nothing is selected

## 5. JSON sample and file load

- [x] 5.1 Add `mini-pipeline/sample-pipeline.json` (or equivalent) matching the documented v1 format with a small example pipeline
- [x] 5.2 Implement “Load sample” using inlined or fetched bundled JSON (no network in the strict sense if inlined)
- [x] 5.3 Implement `<input type="file">` JSON load: validate structure, replace model on success, show clear error on failure without destroying prior state

## 6. Polish and checks

- [x] 6.1 Apply clean typography, spacing, and focus states for controls (per “clean UI” requirement)
- [x] 6.2 Manually verify all spec scenarios once; adjust copy to state diagram-only scope if needed
