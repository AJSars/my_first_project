## 1. Data model & validation

- [x] 1.1 Extend v2 validation (`bipartite-rules.mjs`) to accept optional numeric `x` / `y` on each Process and File; reject invalid types; preserve backward compatibility when omitted
- [x] 1.2 Extend normalization / export (`export-v2.mjs` or equivalent) so **Save / Export** includes `x` and `y` for all positioned entities
- [x] 1.3 On **load**, merge coords into `posProcess` / `posFile`; define deterministic fallback when only some entities have coords (document in README)

## 2. Layered Cleanup

- [x] 2.1 Replace or augment `rebuildBipartiteCleanup` in `graph-geometry.js` (or extracted module) with a **connectivity-aware** layered layout that **does not** default to “all Processes in column A, all Files in column B” as the only rule
- [x] 2.2 Enforce **column type alternation** (Process / File / …) wherever bipartite adjacency allows; document escape hatches for branching / shared nodes (extra columns or rows)
- [x] 2.3 Implement **deterministic** tie-breaking (stable id ordering)
- [x] 2.4 Add at least one **crossing-reduction** pass (e.g. barycenter/median between layers) within bounded iterations; keep runtime suitable for in-browser use
- [x] 2.5 Keep **Cleanup** strictly **non-mutating** on `processes`, `files`, `links` content (same as today)

## 3. App integration

- [x] 3.1 Wire load path so saved files **restore** the user’s arrangement when `x`/`y` present; status or docs clarify when **Cleanup** overwrites coords only (not data)
- [x] 3.2 Ensure **new** Process/File placement remains usable before first Cleanup (existing `placeNew*` or updates)
- [x] 3.3 Update user-facing copy if needed (README / hints): Cleanup describes layered flow, not “two columns only”

## 4. Tests

- [x] 4.1 Unit tests: export → parse → `validateV2Payload` with coords; **exact** round-trip `x`/`y` equality for a small diagram (same layout after load)
- [x] 4.2 Unit tests: **Cleanup** leaves **structural key** / multiset of links unchanged; Process/File **ids, labels, details** unchanged (only positions change)
- [x] 4.3 Unit tests: **explicit acceptance** fixture — two Processes, one File, both linked to that File; after **Cleanup**, File x is **strictly between** the two Process x values, and the two Process x values **differ** (not legacy two-slab layout)
- [x] 4.4 Regression: legacy v2 JSON **without** `x`/`y` still loads

## 5. Fixtures & docs

- [x] 5.1 Update `sample-pipeline.json` and/or tests fixtures if useful to showcase layered cleanup or saved coords _(covered by tests; sample remains coords-free for legacy demo)_
- [x] 5.2 Update `mini-pipeline/README.md` for optional coords and new Cleanup behavior
