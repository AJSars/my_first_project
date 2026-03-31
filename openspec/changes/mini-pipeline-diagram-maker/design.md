## Context

The repository is a learning sandbox; this change adds a **browser-only** tool for sketching simple pipeline-style graphs. Users run it locally (file or static server). There is no existing web app in-repo; this is a greenfield front-end feature with strict v1 simplicity.

## Goals / Non-Goals

**Goals:**

- Deliver a **single HTML entry** (plus small JS/CSS modules or one bundle-free script) that runs entirely in the client.
- Represent the diagram as an explicit **graph model**: nodes with ids, labels, optional detail text; directed edges with **from**, **to**, and **label** (file name or asset type).
- Render an understandable **flow visualization** (nodes as shapes, edges as arrows/lines with labels).
- Support **create/edit** flows: add/delete nodes, add/delete edges, edit edge labels.
- **Inspect** a node by selection (click): show id, label, detail, and incoming/outgoing edges.
- **Import** a diagram by reading a **user-selected local JSON** file with a documented shape; provide or generate a **bundled sample** the user can load in one click for demos.
- **Clean UI**: readable typography, clear toolbar/panels, unobtrusive chrome.

**Non-Goals (v1):**

- Automatic filesystem or repo scanning.
- Integrations with CI, orchestrators, or cloud storage.
- Accounts, login, or sync.
- Server-side persistence or database.
- General diagramming (no swimlanes, no freehand).

## Decisions

1. **Stack: plain HTML + CSS + ES modules (or single script) — no build step required.**  
   **Rationale:** Matches “extremely simple” and easy for beginners to open and read. **Alternative considered:** Vite/React — rejected for v1 complexity and toolchain.

2. **Graph rendering: SVG inside the page, positions from a small layout routine.**  
   **Rationale:** Crisp at any zoom, simple hit-testing for click. **Alternative:** Canvas — more code for text/labels; **Alternative:** External graph lib via npm — adds bundling or large CDN; avoided for v1.

3. **Layout: layered left-to-right (DAG-style) with deterministic fallback when cycles exist.**  
   **Rationale:** Good default for “pipeline” metaphor without physics engines. If the graph has cycles, assign ranks with a simple heuristic and show a subtle note that layout is approximate.

4. **State: in-memory only; optional “download JSON” for export (nice-to-have if tasks allow).**  
   **Rationale:** No database; user saves via browser download if desired. Spec can treat export as optional follow-up—proposal didn’t require export; I’ll mention in tasks as optional to avoid scope creep.

5. **JSON schema (v1):**
   ```json
   {
     "version": 1,
     "nodes": [{ "id": "string", "label": "string", "detail": "string (optional)" }],
     "edges": [{ "id": "string (optional)", "from": "nodeId", "to": "nodeId", "label": "string" }]
   }
   ```  
   **Rationale:** Stable, easy to author by hand; sample file lives in-repo.

6. **Running locally:** Document that opening via `file://` may differ by browser; recommend `python -m http.server` or VS Code Live Server for frictionless `fetch` of bundled sample if used.

## Risks / Trade-offs

- **[Risk] `file://` restrictions** → **Mitigation:** Bundled sample can be inlined in JS as a constant for guaranteed one-click load; file input remains for custom JSON.
- **[Risk] Messy overlaps on dense graphs** → **Mitigation:** v1 accepts simple layouts; minimum padding and edge label offsets.
- **[Risk] Users expect real pipeline execution** → **Mitigation:** Clear title/subcopy that this is a **diagram only** learning tool.

## Migration Plan

- Add new files under a dedicated folder (e.g. `mini-pipeline/`). No migration from prior app versions.

## Open Questions

- Whether to include **export JSON** in v1 tasks (optional stretch; not required by user brief).
