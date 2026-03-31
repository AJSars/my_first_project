## Why

Lesson-sized data and asset pipelines are easy to describe in conversation but hard to keep straight as text. A tiny, local-only diagram tool lets learners sketch nodes (“steps”) and directed edges with file or asset-type labels, inspect a node’s details, and reset from sample JSON—without the overhead of cloud auth, databases, or real pipeline integrations.

## What Changes

- Add a **single-page, local-only** web app (“Mini Pipeline Diagram Maker”) served as static files (no login, no backend, no database).
- **Graph model in the browser**: users add/remove nodes, add/remove directed edges between nodes, and set each edge label to a file name or asset type string.
- **Visualization**: show the flow as a graph layout on one canvas/view with a clean, minimal UI.
- **Node inspection**: clicking a node shows its details (identifier, optional notes, connected edges summary) in a panel or modal.
- **Sample data**: ability to load a predefined diagram from a **local JSON file** via file picker (or bundled sample trigger); no automatic filesystem scanning.
- **Explicit non-goals for v1** (not in scope): automatic directory scanning, CI/pipeline integrations, authentication, cloud sync or hosted APIs.

## Capabilities

### New Capabilities

- `mini-pipeline-diagram-v1`: End-user behavior and constraints for the Mini Pipeline Diagram Maker v1: graph editing, labeled edges, visualization, node inspection, local JSON sample load, and simplicity boundaries.

### Modified Capabilities

- _(none — no existing requirements under `openspec/specs/` to amend)_

## Impact

- **New** static web assets (e.g. `mini-pipeline/` or project root `index.html` + JS/CSS) and optional `sample-pipeline.json`.
- **Dependencies**: keep client-side only; any graph layout library must be vendored or pinned for offline/local use if used.
- **No** server deployment requirement for v1; optional `README` note on opening via local static server if browsers block `file://` for some features.
