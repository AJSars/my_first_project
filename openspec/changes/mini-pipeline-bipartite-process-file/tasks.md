## 1. Data model and validation

- [x] 1.1 Replace in-memory `nodes`/`edges` with `processes`, `files`, `links` (`processId`+`fileId`); enforce globally unique ids across processes and files
- [x] 1.2 Implement `validateV2` and reject cross-partition violations, unknown ids, duplicate links, and **v1** payloads with a clear error message
- [x] 1.3 Replace `sample-pipeline.json` with a v2 example; update inlined sample in `app.js`

## 2. Rendering

- [x] 2.1 Render Processes as circles and Files as rectangles with readable labels
- [x] 2.2 Draw links as lines (or simple segments) between the correct shapes; update on model changes

## 3. Toolbar and vocabulary

- [x] 3.1 Rename UI copy to Process/File/Link; add Process, add File, create link (Process↔File), delete selection, inspector
- [x] 3.2 Block same-partition linking in UI and show status feedback

## 4. Drag and zoom

- [x] 4.1 Implement pointer drag for processes and files in SVG user space; live line updates during drag and after release
- [x] 4.2 Preserve compatibility with **Reset zoom** and viewBox behavior; ensure drag coordinates stay consistent under zoom

## 5. Cleanup and geometry

- [x] 5.1 Implement **Cleanup** button and deterministic bipartite layout (e.g. processes column left, files column right, vertical packing)
- [x] 5.2 Refactor or replace `graph-geometry.js` for v2 positions map and Cleanup; keep `npm test` passing

## 6. File I/O and docs

- [x] 6.1 File pick load/save path (if export exists) for v2 only; backup/restore on failed load
- [x] 6.2 Update `README.md` with v2 schema, drag, Cleanup, breaking change from v1
- [x] 6.3 Wire `app.js` to `bipartite-rules.mjs` (or equivalent) for link validation; keep `npm test` green including `tests/bipartite-acceptance.test.mjs`
