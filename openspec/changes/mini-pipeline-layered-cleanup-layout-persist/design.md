## Context

- Today, **Cleanup** in `graph-geometry.js` sorts ids and places **all Processes** in one vertical column and **all Files** in a second column.
- **Export** builds logical v2 (`processes`, `files`, `links`) but **drops** `posProcess` / `posFile`, so reload cannot restore drag positions.

## Goals

1. **Layered Cleanup** that reads as **left-to-right flow** aligned with **connectivity**, not partition-only grouping.
2. **Alternating columns by type** (P, F, P, F, …) **when structure allows**.
3. **Cleanup** = **geometry only**; **graphStructuralKey**-class invariants unchanged.
4. **Heuristic quality**: prefer **fewer crossings** and **shorter perceived link length** / **closer** adjacent peers when choosing
   among layouts (bounded work; exact crossing minimization is non-goal).
5. **Round-trip positions** in saved JSON.

**Explicit acceptance** (normative detail lives in `specs/mini-pipeline-bipartite-v1/spec.md`): a minimal **P–F–P** fixture
(two Processes, one File, both linked to it) MUST lay out with the File **between** the two Processes on x, not as two vertical
partition slabs; **Cleanup** MUST NOT change entities or links; **Save** MUST emit **`x`/`y` for every** Process and File; **Load** MUST restore the **same layout**.

## Non-Goals

- Optimal crossing minimization NP-hard guarantees.
- Edge routing, ports, or splines beyond straight segments.
- Changing link semantics or bipartite rules.

## JSON: optional coordinates (normative intent)

- Keep **`version: 2`**.
- Each **Process** and **File** object MAY include optional numeric **`x`** and **`y`** (SVG / layout space, same units as today’s position maps).
- **Loader** behavior:
  - If **`x`/`y`** present for an id, apply to internal position maps after validation (finite numbers; optional bounds clamp if implementation chooses).
  - If missing, use current defaults (e.g. placement helpers and/or run **Cleanup** on full load—**proposal**: prefer merging partial coords + **Cleanup** only where needed, or document one consistent rule in tasks).
- **Exporter** MUST emit **`x`/`y`** for every Process and File that has a defined position in the editor (so reopen matches).

**Validator** updates:

- Reject non-numeric **`x`/`y`** if present; treat absent as valid legacy.

## Cleanup algorithm (implementation sketch)

Exact code is left to `/opsx:apply`; the **spec** encodes outcomes. Suggested direction:

1. **Build** adjacency: Process ↔ File via links (undirected for layering).
2. **Layer index** (column): assign integers increasing **left → right** so that **most** links span **adjacent** layers (difference 1). Bipartite constraint: adjacent layers MUST alternate **Process / File** (or **File / Process** depending on chosen pole). Non-adjacent links indicate need for **extra** layers or **vertical** separation.
3. **Initialization**: e.g. choose **leftmost** layer type from data (often **Process** if sources exist; tie-break by **stable id sort**). For DAG-like flows without explicit direction, derive a pseudo-order using **BFS** from “boundary” nodes (e.g. minimum degree, or connected-component local rules)—document the deterministic choice in code comments.
4. **Ordering within layer**: use **barycenter / median** passes (2–4 iterations) to **reduce crossings** between successive layers.
5. **Coordinates**: map layer → **x**, rank → **y**, with constants compatible with existing `PAD`, `ROW_H`, `GAP_X`-style spacing (values MAY be retuned).
6. **Determinism**: same inputs → same layout (stable sorts on ids where ties occur).

## Risks / Trade-offs

- **Dense** graphs may still need **many** columns; readability may plateau—acceptable.
- Legacy samples without coords: first paint may differ until user runs **Cleanup** or drags.

## Migration

- No version bump required. Old files load unchanged logically; positions recomputed per loader rules.

## Open Questions (defer to apply)

- Whether **Load sample** ships **with** coords (nice for demos) or relies on **Cleanup**.
- Exact clamp policy for extreme coordinates from hand-edited JSON.
