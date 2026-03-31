## ADDED Requirements

### Requirement: Explicit user acceptance — Reset zoom visibility, margin, and positions

The implementation SHALL satisfy all of the following **explicit acceptance criteria**:

1. **Full visibility** — After **Reset zoom**, **every** **Process** shape, **every** **File** shape, and **every** **connection** (**link** line segment drawn between its Process and File) SHALL be **fully visible** within the **canvas** (the SVG view as presented to the user), with **no clipping** of those elements by the viewport edges.

2. **Visible margin** — After **Reset zoom**, the viewport SHALL be sized and positioned so that a **margin** (empty padding) is **visible** between the **outer bounds** of the graph content (including all shapes and their connecting segments) and the **edges of the canvas**. The margin SHALL be **positive** on all sides (implementation-defined size, consistent for a given version).

3. **Positions unchanged** — **Reset zoom** MUST **not** change the **layout positions** of any Process or File (`x`, `y` in layout state). It MUST **not** add, remove, or edit Processes, Files, or links—**only** viewport / camera state.

#### Scenario: Nothing clipped after Reset zoom

- **WHEN** the diagram has at least one Process or File (and any links)
- **AND** the user activates **Reset zoom**
- **THEN** no part of any Process circle, File rectangle, or rendered **link** line SHALL fall outside the visible canvas (viewport)

#### Scenario: Margin is visibly present

- **WHEN** the user activates **Reset zoom** on a non-empty diagram
- **THEN** there SHALL be **visible empty space** (margin) between the combined extents of all graph ink (nodes and link segments) and each edge of the canvas

#### Scenario: Coordinates unchanged

- **WHEN** the user activates **Reset zoom**
- **THEN** each Process and each File SHALL have the **same** `x` and `y` layout coordinates **before and after** the action (exact equality in tests)

---

### Requirement: Reset zoom fits the full graph in the viewport

The **Reset zoom** control SHALL reframe the **visible** graph so that **every** **Process** (including its circular shape), **every** **File** (including its rectangle), and **every** **connection** (the line drawn for each link between the correct shapes) falls **entirely** inside the current **viewport** (SVG **`viewBox`** / equivalent pan–zoom parameters), using the **current** layout coordinates. The viewport SHALL be chosen using an **axis-aligned bounding region** that contains all node geometry and the **link segments** as rendered (or an equivalent union that guarantees segment visibility), plus a **small uniform margin** on all sides. The margin size MAY be implementation-defined but SHALL be **positive** and **consistent** for a given product version.

#### Scenario: Non-empty diagram after Reset zoom

- **WHEN** the diagram has at least one Process or File with a defined position
- **AND** the user activates **Reset zoom**
- **THEN** the viewport SHALL enclose all Process circles, File rectangles, and link lines with **no clipping**
- **AND** there SHALL be visible **padding** between the outermost graph content and the viewport edges (the margin)

#### Scenario: Reset zoom does not change graph data or layout

- **WHEN** the user activates **Reset zoom**
- **THEN** the multiset of Processes, Files, and links SHALL be unchanged
- **AND** each Process and each File **coordinate** (`x`, `y` in layout state) SHALL be unchanged
- **AND** only **viewport** / **camera** state MAY change

#### Scenario: Reset zoom after pan or zoom does not move shapes

- **WHEN** the user has changed zoom or pan (e.g. **Ctrl** + scroll) so the view no longer matches the default fit
- **AND** the user activates **Reset zoom**
- **THEN** the viewport SHALL update to fit the full graph per **Reset zoom fits the full graph in the viewport**
- **AND** Process and File **layout coordinates** SHALL remain the same as immediately before **Reset zoom**

---

### Requirement: Reset zoom default for an empty graph

**WHEN** the diagram has **no** Processes and **no** Files, **Reset zoom** SHALL set the viewport to a **sensible default** (a documented minimum or fixed region suitable for an empty canvas). The implementation MUST NOT require non-empty geometry to complete the action.

#### Scenario: Empty diagram is valid

- **WHEN** **Reset zoom** runs on an empty diagram
- **THEN** the app SHALL NOT error
- **AND** graph data SHALL remain empty
