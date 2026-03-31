## ADDED Requirements

### Requirement: Lightweight tooling (no heavy stacks)

The automated test approach for this app SHALL be **minimal**: appropriate for a **small static site**, not a large SPA platform. The project SHALL **NOT** add complex build systems, transpilers, or **heavy** test frameworks (e.g. bundled Jest/Vitest stacks, Playwright/Cypress as **mandatory** deps) solely to satisfy this capability. **Node’s built-in test runner** and **vanilla** browser snippets are the **preferred** stack.

#### Scenario: Default tests are Node built-in

- **WHEN** a developer runs **`npm test`**
- **THEN** the command SHALL run using **`node --test`** (or equivalent one-liner) on plain **ESM** `*.mjs` files **without** a compile step

#### Scenario: No new heavyweight dependencies by default

- **WHEN** this capability is implemented
- **THEN** `package.json` SHALL NOT gain **required** devDependencies for browsers drivers, jsdom, or task runners beyond what is already acceptable for the repo—**zero** new deps is the target

---

### Requirement: Local automated test suite

The Mini Pipeline Diagram Maker project SHALL maintain an automated test suite that runs **entirely on the developer (or CI) machine** with **no dependency on external test services**, SaaS dashboards, or **paid** remote browser grids. The default invocation SHALL be via **`npm test`** using **Node.js** built-in test APIs.

#### Scenario: Tests run without network services

- **WHEN** a developer runs the test command with no network connectivity
- **THEN** the suite SHALL still execute and SHALL NOT require calls to third-party HTTP APIs solely to pass

---

### Requirement: Tests validate main vs graph control layout

The test suite SHALL assert that the **main controls** region contains the **create**, **edit**, **link**, **load**, and **save** affordances, and that the **graph controls** region contains **Reset zoom** and **Cleanup** and does **not** subsume the primary **save** / **load** / **link** / **create** actions.

#### Scenario: Main controls include required actions

- **WHEN** tests inspect the main controls markup (or equivalent stable selectors)
- **THEN** they SHALL verify presence of controls for: adding a **Process**, adding a **File**, creating a **link**, **loading** (sample and/or file), **saving/exporting** JSON, and **editing** (inspector or edit fields tied to selection, as implemented)

#### Scenario: Graph controls include zoom and cleanup only

- **WHEN** tests inspect the graph controls markup
- **THEN** they SHALL verify **Reset zoom** and **Cleanup** are present
- **AND** they SHALL verify that **save**, **load sample**, **load file**, **add Process**, **add File**, and **add link** primary controls are **not** placed inside the graph controls region (duplicate buttons elsewhere MAY exist only if the spec under apply forbids it—tests follow the authoritative UI spec)

---

### Requirement: Tests validate Cleanup behaviour

The test suite SHALL assert that **Cleanup** (or its pure layout helper) produces a **left-to-right** readable arrangement (e.g. Process column left of File column) and that **graph-derived data** (Processes, Files, links) is **unchanged** by Cleanup.

#### Scenario: Structural equality after cleanup

- **WHEN** tests run Cleanup layout logic on a fixed in-memory diagram
- **THEN** `processes`, `files`, and `links` content SHALL match a pre-Cleanup snapshot (ids, labels, link pairs)

#### Scenario: Horizontal ordering intent

- **WHEN** tests run Cleanup on a non-empty diagram
- **THEN** resulting positions SHALL satisfy a documented left-to-right rule (e.g. all Process centers left of all File centers, or per design doc)

---

### Requirement: Tests validate connection rules and drag model

The test suite SHALL include assertions that **invalid bipartite connections** are rejected by validation logic, and that **moving shape coordinates** does **not** alter link identities (**connections preserved** at the data level).

#### Scenario: Invalid connections blocked

- **WHEN** tests supply invalid link definitions (unknown id, duplicate pair, same-partition attempt per rules module)
- **THEN** validation SHALL fail with a non-null error as asserted by tests

#### Scenario: Drag preserves connections at model level

- **WHEN** tests mutate stored positions of a Process or File in a diagram with links
- **THEN** the link list SHALL remain byte-for-byte equivalent (or structurally equal) aside from the position maps

---

### Requirement: Tests validate save export shape

The test suite SHALL assert that the **save/export** path produces **version 2** JSON containing **`processes`**, **`files`**, and **`links`** arrays consistent with the current model and acceptable to **`validateV2Payload`** (or stricter round-trip check).

#### Scenario: Export JSON validates

- **WHEN** tests build an export object from a known fixture state
- **THEN** `validateV2Payload` (or equivalent) SHALL return **no error** for that object

#### Scenario: Export is local-only mechanism in tests

- **WHEN** tests exercise export logic
- **THEN** they SHALL NOT open real network sockets or upload payloads to external URLs as part of the test
