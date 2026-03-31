## ADDED Requirements

### Requirement: Explicit acceptance — main controls bundle

The **main controls** section SHALL be the **single** primary home for all **model and file** actions required to build and persist the diagram from the app UI: **create**, **edit**, **link**, **load**, and **save** (local JSON export). Each of these five categories SHALL be reachable from controls **within** the main controls region (the inspector may sit alongside it but SHALL remain grouped with the same “main” column/panel if present).

#### Scenario: Create actions live in main controls

- **WHEN** the user needs to add a new **Process** or **File**
- **THEN** the corresponding controls SHALL appear inside the main controls section

#### Scenario: Edit actions live in main controls

- **WHEN** the product offers editing of the current selection (labels, details, or apply-type controls)
- **THEN** those editing affordances SHALL appear inside the main controls section or its paired inspector block in the same main column—not inside the graph controls section

#### Scenario: Link actions live in main controls

- **WHEN** the user creates a Process–File **link** from the toolbar
- **THEN** the link-creation controls SHALL appear inside the main controls section

#### Scenario: Load actions live in main controls

- **WHEN** the user loads sample data or picks a JSON file from disk
- **THEN** those load controls SHALL appear inside the main controls section

#### Scenario: Save lives in main controls

- **WHEN** the user exports the current diagram to a local JSON file
- **THEN** the save/export control SHALL appear inside the main controls section

---

### Requirement: Explicit acceptance — graph controls are zoom and cleanup only

The **graph controls** section (placed **near the graph canvas**) SHALL contain **only** **Reset zoom** and **Cleanup** as **primary, labeled actions** for changing the canvas. It MUST NOT duplicate or replace **Create**, **Edit**, **Link**, **Load**, or **Save**; those MUST remain in main controls. Incidental UI (short hint text, keyboard legends) DOES NOT count as an extra primary action.

#### Scenario: Graph region placement

- **WHEN** the user views the workspace that contains the SVG canvas
- **THEN** the graph controls region SHALL be **adjacent** to that canvas (above, beside, or below it in the same workspace)

#### Scenario: Graph region lists only Reset Zoom and Cleanup

- **WHEN** the user inspects the graph controls region for actionable buttons or links that change zoom or layout policy
- **THEN** exactly **two** such actions SHALL be present: **Reset zoom** and **Cleanup**
- **AND** there SHALL NOT be controls in that region for adding Processes, Files, links, loading files, or saving/exporting JSON

#### Scenario: Zoom and cleanup are on the canvas strip

- **WHEN** the user looks for **Reset zoom** or **Cleanup**
- **THEN** both SHALL be exposed in the graph controls region adjacent to the canvas (the canonical place for these two actions; they SHOULD NOT be offered **only** in the main controls section without also appearing here)

---

### Requirement: Cleanup improves left-to-right readability without changing graph data

The **Cleanup** action SHALL improve diagram **readability** using a **left-to-right** arrangement (e.g. Processes in a leading column, Files to the right). It SHALL **preserve** every **Process**, every **File**, and every **connection** (**link**): counts, ids, labels, details, and the multiset of `(processId, fileId)` pairs MUST be unchanged. Only **layout state** (positions and, if applicable, default viewBox fit after Cleanup) MAY change.

#### Scenario: All processes preserved after Cleanup

- **WHEN** the user runs **Cleanup**
- **THEN** the set of Process entities (ids and field values) SHALL equal the set immediately before Cleanup

#### Scenario: All files preserved after Cleanup

- **WHEN** the user runs **Cleanup**
- **THEN** the set of File entities (ids and field values) SHALL equal the set immediately before Cleanup

#### Scenario: All connections preserved after Cleanup

- **WHEN** the user runs **Cleanup**
- **THEN** the multiset of links (each `processId`+`fileId` pair) SHALL equal the multiset immediately before Cleanup

#### Scenario: Left-to-right readability

- **WHEN** **Cleanup** runs on a non-empty diagram
- **THEN** the resulting positions SHALL yield a clearer left-to-right flow (Processes generally left of Files, or an equivalent bipartite left-to-right layout)

---

### Requirement: Local save only — no backend or cloud storage

Saving (export) SHALL operate **entirely in the browser** for that feature: the user receives a **local JSON file** (download). The save flow MUST NOT **introduce** or **require** an application **backend**, remote **API**, **database**, or **cloud object storage** to complete the action. (Using the browser’s own download mechanism is sufficient.)

#### Scenario: Export produces local JSON

- **WHEN** the user activates save/export
- **THEN** the browser SHALL offer a downloadable `.json` file whose payload is **version 2** and matches the current `processes`, `files`, and `links`

#### Scenario: Save does not call backend or cloud

- **WHEN** the user saves/export the diagram
- **THEN** the implementation SHALL NOT send that diagram content to a remote server, cloud bucket, or hosted database as part of the save action

#### Scenario: Save works without network

- **WHEN** the network is unavailable
- **THEN** save/export SHALL still complete using only local browser facilities

---

### Requirement: Single-page local product (scope)

These UI and save adjustments SHALL NOT force adoption of a server-hosted app shell, mandatory login, or third-party SaaS for core editing. The experience SHALL remain appropriate for a **single-page**, **local-first** HTML/JS deployment.

#### Scenario: No new mandatory cloud account for save

- **WHEN** the user exports the diagram
- **THEN** the system SHALL NOT require the user to sign in to a cloud provider solely to obtain the JSON file
