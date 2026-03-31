## ADDED Requirements

### Requirement: Explicit user acceptance — Cleanup chain, data safety, and layout round-trip

The implementation SHALL satisfy all of the following **explicit acceptance criteria** (and the scenarios below):

1. **Cleanup on a simple chain** — After **Cleanup**, a diagram that is only a **short alternating path** **Process → File → Process** (defined for acceptance as: **exactly two distinct Processes**, **exactly one File**, **both** Processes linked to that File, **no** other entities or links) SHALL **not** be laid out as **all Processes in one vertical column and all Files in another** (the legacy two-slab pattern). Instead, Cleanup SHALL assign horizontal positions such that the **File sits between the two Processes** along the left-to-right axis: the File’s layout x SHALL lie **strictly between** the smaller and the larger of the two Processes’ layout x values, and the two Processes’ layout x values SHALL **differ** (so the chain reads as alternating **Process → File → Process**, not **Process, Process | File**).

2. **Cleanup mutates geometry only** — **Cleanup** MUST **not** add, remove, or edit Process or File **entities** (ids, labels, details) or **connections** (**links**). It MUST change **only** layout coordinates (and, if applicable, camera / viewBox defaults tied to layout), never the logical graph.

3. **Save carries every position** — **Save / Export** MUST include a numeric **`x`** and **`y`** on **every** Process and **every** File in the exported v2 payload (same coordinate space as on-screen layout).

4. **Load restores layout** — Loading that saved file MUST restore the **same** arrangement: each Process and File MUST render at the **`x` and `y`** stored for its `id` (exact round-trip in automated tests unless the product documents non-zero tolerance).

#### Scenario: Simple P–F–P chain is not the legacy two-column partition layout

- **WHEN** the diagram contains exactly two Processes and one File, both Processes are linked to that File, and there are no other processes, files, or links
- **AND** the user runs **Cleanup**
- **THEN** the two Processes’ layout x-coordinates SHALL **not** be equal to one another (they SHALL **not** share a single “all Processes” column while the File alone occupies a second column)
- **AND** the File’s layout x-coordinate SHALL be **strictly greater** than the minimum of the two Processes’ x-coordinates and **strictly less** than the maximum (**File between Processes** along x)

#### Scenario: Cleanup does not modify entities or connections

- **WHEN** the user runs **Cleanup**
- **THEN** the sets of Process ids, File ids, and `(processId, fileId)` link pairs (including link ids if present) SHALL remain unchanged, as SHALL each entity’s `label` and `detail` fields
- **AND** only coordinates (and permissible view state) MAY change

#### Scenario: Export includes every Process and File position

- **WHEN** the user exports the current diagram to JSON
- **THEN** every element of `processes` SHALL include numeric `x` and `y`
- **AND** every element of `files` SHALL include numeric `x` and `y`

#### Scenario: Load restores the same saved layout

- **WHEN** the user loads a JSON file that was produced by **Save / Export** from this product with stored coordinates
- **THEN** each Process and File SHALL use the saved `x` and `y` for its canvas position so the visible layout matches the saved layout (**exact** equality in tests unless documented otherwise)

---

### Requirement: Layered Cleanup driven by connectivity

The **Cleanup** action SHALL replace any fixed “single Process column + single File column for all nodes” rule as the **primary** readability strategy. Instead, Cleanup SHALL compute a **left-to-right layered** placement where **layer assignment is driven mainly by link **connectivity** and dependency-style order (treating the bipartite graph as the source of truth), not by grouping all Processes together and all Files together.

#### Scenario: Cleanup uses structure, not partition-only columns

- **WHEN** the user runs **Cleanup** on a diagram whose links form a simple alternating chain (Process–File–Process–File–…)
- **THEN** the resulting layout SHALL place those entities in **distinct successive columns** following that chain so the visual order reads **Process → File → Process → File** (left to right) where the structure permits

#### Scenario: Cleanup still respects bipartite links

- **WHEN** **Cleanup** completes
- **THEN** every link SHALL still connect exactly one Process and one File geometrically, with endpoints on the correct shapes

---

### Requirement: Alternating types across columns when structure allows

The **Cleanup** layout algorithm MUST, where the graph topology permits **without breaking bipartite adjacency**, place successive **horizontal** columns (layers) so entity types **alternate** (**Process**, **File**, **Process**, **File**, …) to the maximum extent the link structure allows, so the canvas reads as a **flow** rather than two monolithic blocks.

#### Scenario: Branching does not corrupt types

- **WHEN** the diagram has branching or shared Files/Processes such that strict alternation in one dimension is impossible
- **THEN** the implementation MAY introduce **additional** columns or **row** offsets while keeping types valid per column and preserving all links

---

### Requirement: Cleanup layout quality heuristics

When **multiple** valid coordinate assignments satisfy the layered rules, the implementation MUST apply a **deterministic local heuristic** that favors layouts with **fewer line crossings** and that keep **directly linked** Process–File pairs **visually closer** than an arbitrary baseline placement, subject to reasonable performance limits in the browser (global optimum is NOT required).

#### Scenario: Local heuristic only

- **WHEN** **Cleanup** runs on diagrams of moderate size (as defined by product tests)
- **THEN** the algorithm SHALL complete without requiring network access
- **AND** the implementation is NOT required to achieve globally minimal crossing counts

---

### Requirement: Persist manual layout in saved JSON

**Save / Export** MUST include each Process’s and each File’s **layout coordinates** (`x` and `y`) in the exported v2 JSON so that a user’s **manual** arrangement (including after drag) is preserved.

#### Scenario: Export carries positions

- **WHEN** the user exports the diagram to JSON
- **THEN** every Process and every File in the payload SHALL include numeric `x` and `y` fields reflecting the current canvas positions (same coordinate space as rendering)

#### Scenario: Reload restores arrangement

- **WHEN** the user loads a previously exported JSON that includes `x` and `y` for Processes and Files
- **THEN** those entities SHALL appear at the corresponding positions so the **same layout** is restored (**exact** round-trip in tests unless documented clamping applies)
- **AND** links SHALL render between the correct shapes

---

### Requirement: Legacy v2 files without coordinates

v2 JSON files that omit `x` / `y` on some or all entities MUST remain **valid**. Loading such files MUST NOT fail solely due to missing coordinates.

#### Scenario: Omitted coordinates still load

- **WHEN** the user loads a valid v2 file with no `x`/`y` fields
- **THEN** the system SHALL load **processes**, **files**, and **links** successfully
- **AND** the implementation SHALL apply a **documented fallback** for positioning (e.g. default placement and/or offering **Cleanup**)

---

## MODIFIED Requirements

### Requirement: Cleanup improves left-to-right readability without changing graph data

The **Cleanup** action SHALL improve diagram **readability** using a **left-to-RIGHT layered flow** derived from **link connectivity**, attempting **Process → File → Process → File** alternation across columns **where the topology allows**. It SHALL **preserve** every **Process**, every **File**, and every **connection** (**link**): counts, ids, labels, details, and the multiset of `(processId, fileId)` pairs MUST be unchanged. Only **layout state** (positions and, if applicable, default viewBox fit after Cleanup) MAY change.

#### Scenario: All inputs preserved after Cleanup (unchanged)

- **WHEN** the user runs **Cleanup**
- **THEN** the multiset of Process entities (ids and non-coordinate fields), File entities (ids and non-coordinate fields), AND links SHALL equal those immediately before Cleanup

#### Scenario: Left-to-right flow is connectivity-aware (updated)

- **WHEN** **Cleanup** runs on a non-empty diagram
- **THEN** the resulting positions SHALL favor a **left-to-right** interpretation guided by **connections**, not by placing **all** Processes in one vertical slab independently of graph shape

#### Scenario: Export includes coordinates (updated expectation)

- **WHEN** the user saves or exports the diagram
- **THEN** the saved JSON MUST include `x` and `y` for **every** Process and File so reload reproduces the same layout (see **Explicit user acceptance — Cleanup chain, data safety, and layout round-trip**)
