## ADDED Requirements

### Requirement: Explicit user acceptance criteria

A user MUST be able to complete the following without leaving the single-page app and without any backend: create a **Process**, create a **File**, create **links** only between Process and File (in either UI order), **drag** either kind of shape while **lines remain visually attached**, **delete** a selected Process or File, run **Cleanup** to improve layout, and use **Reset zoom** as before. **Invalid connections** (anything that is not a valid Process–File pair) MUST be blocked in the UI and in loaded data.

#### Scenario: User can create a Process

- **WHEN** the user uses the create-Process affordance and supplies or accepts a label
- **THEN** a new Process SHALL exist in the model and SHALL appear as a circle on the canvas

#### Scenario: User can create a File

- **WHEN** the user uses the create-File affordance and supplies or accepts a label
- **THEN** a new File SHALL exist in the model and SHALL appear as a rectangle on the canvas

#### Scenario: User can connect only Process–File (or File–Process in UI terms)

- **WHEN** the user links an existing Process to an existing File (or picks endpoints in the UI in the order File then Process)
- **THEN** exactly one bipartite link SHALL be created and drawn as a line between those two shapes

#### Scenario: User cannot create Process–Process or File–File in the UI

- **WHEN** the user attempts to complete a link using two Processes or two Files
- **THEN** the system SHALL refuse to add the link, SHALL NOT mutate processes, files, or links, and SHALL show a clear message

#### Scenario: Dragging preserves line attachment (visual)

- **WHEN** the user drags a Process or File that has one or more incident links
- **THEN** during pointer move and after pointer up, each incident line SHALL connect that shape to the correct counterpart shape (no detached or stale endpoints for that drag operation)

#### Scenario: User can delete a selected Process

- **WHEN** a Process is selected and the user activates delete
- **THEN** that Process SHALL be removed and every link incident to it SHALL be removed; Files not selected SHALL remain unless separately deleted

#### Scenario: User can delete a selected File

- **WHEN** a File is selected and the user activates delete
- **THEN** that File SHALL be removed and every link incident to it SHALL be removed; Processes not selected SHALL remain unless separately deleted

#### Scenario: Cleanup improves layout without changing graph data

- **WHEN** the user activates **Cleanup** on a non-empty diagram
- **THEN** the multiset of Process identities, File identities, and Process–File link pairs SHALL be unchanged after Cleanup (only geometry: positions and, if applicable, camera/viewBox fit flags—**not** the logical graph)
- **AND** the diagram SHALL remain easier to interpret per the Cleanup algorithm’s stated arrangement rules (e.g. separated partitions)

#### Scenario: Loaded JSON with invalid same-partition link is blocked

- **WHEN** the user loads a file declaring a link whose endpoints do not resolve to one Process id and one File id in the v2 model
- **THEN** the load SHALL fail with an explicit error and the prior on-screen diagram state SHALL be preserved

---

### Requirement: Process and File entities (bipartite model)

The system SHALL distinguish two entity kinds: **Processes** and **Files**. Each entity SHALL have a unique string `id`, a string `label`, and an optional string `detail`. The system SHALL render Processes as **circles** and Files as **rectangles**. User-facing text SHALL use the terms **Process** and **File** (not “node” / “edge” as the primary metaphor).

#### Scenario: Add and show a Process

- **WHEN** the user creates a Process and supplies or accepts a label
- **THEN** it SHALL appear in the model as a Process and SHALL be drawn as a circle on the canvas

#### Scenario: Add and show a File

- **WHEN** the user creates a File and supplies or accepts a label
- **THEN** it SHALL appear in the model as a File and SHALL be drawn as a rectangle on the canvas

---

### Requirement: Links only between Process and File

The system SHALL represent relationships as **links**, each referencing exactly one **processId** and one **fileId**. The graph SHALL be **bipartite**: a link SHALL always connect one Process to one File. Process–Process and File–File connections SHALL be impossible to create via the UI and SHALL be rejected when loading data.

#### Scenario: Allowed link

- **WHEN** the user creates a link from a chosen Process to a chosen File (or File to Process in the UI flow)
- **THEN** a single link SHALL exist between that pair and SHALL be rendered as a line between the Process circle and the File rectangle

#### Scenario: Same-partition connection forbidden in UI

- **WHEN** the user attempts to connect two Processes or two Files with the create-link action
- **THEN** the system SHALL NOT add a link and SHALL surface a clear, non-destructive message (e.g. status text)

#### Scenario: Invalid data on load

- **WHEN** the user loads JSON containing a link whose endpoints are both Processes, both Files, or reference unknown ids
- **THEN** the system SHALL reject the load with a clear error and SHALL keep the prior diagram state

#### Scenario: No duplicate link for the same pair

- **WHEN** the user attempts to add a second link for the same `(processId, fileId)` pair
- **THEN** the system SHALL NOT create a duplicate link

---

### Requirement: Draggable repositioning with live lines

The user SHALL be able to **drag** any Process or File to a new position on the canvas. While dragging and after release, every link incident to that entity SHALL remain visually attached (line endpoints SHALL update so they connect the shapes correctly).

#### Scenario: Drag a Process

- **WHEN** the user drags a Process circle to a new location
- **THEN** during the drag and after pointer release, each link connected to that Process SHALL redraw so it still connects that Process to the correct File

#### Scenario: Drag a File

- **WHEN** the user drags a File rectangle to a new location
- **THEN** during the drag and after pointer release, each link connected to that File SHALL redraw so it still connects that File to the correct Process

---

### Requirement: Cleanup layout action

The system SHALL provide a **Cleanup** control (in addition to **Reset zoom**) that runs an automatic layout intended to make the diagram easier to read. After Cleanup, links SHALL still be valid and SHALL render between the correct Process and File shapes.

#### Scenario: Cleanup runs locally

- **WHEN** the user activates Cleanup
- **THEN** the layout algorithm SHALL run entirely in the browser without network access or backend calls
- **AND** at least one non-trivial arrangement rule SHALL apply (e.g. separate columns or layers for Processes vs Files)

---

### Requirement: JSON format version 2

The system SHALL support loading and saving (if export exists in implementation) diagram data using `version: 2` with `processes`, `files`, and `links` as specified in the design. The app SHALL remain single-page and local-only with no mandatory backend.

#### Scenario: Load valid v2 diagram

- **WHEN** the user loads a valid v2 JSON file
- **THEN** the Processes, Files, and links SHALL populate the model and appear on the canvas

#### Scenario: v1 format not accepted

- **WHEN** the user attempts to load v1-only data (`nodes` / `edges` without v2 bipartite shape)
- **THEN** the system SHALL reject with an explicit message that bipartite v2 format is required (unless a documented migrator is present)

---

### Requirement: Scope guard (no backend or integrations)

The bipartite redesign SHALL NOT add a backend service, database, user accounts, cloud sync, or integrations with external systems.

#### Scenario: Still offline-capable core

- **WHEN** the user edits Processes, Files, links, drag positions, Cleanup, zoom, or loads a local JSON file
- **THEN** those features SHALL NOT depend on network services
