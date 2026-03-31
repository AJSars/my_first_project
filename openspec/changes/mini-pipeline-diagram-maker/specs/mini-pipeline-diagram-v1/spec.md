## ADDED Requirements

### Requirement: Single-page local web application

The system SHALL provide a single-page web interface named Mini Pipeline Diagram Maker that runs entirely in the user’s browser without requiring authentication, a remote API, or a database for core functionality.

#### Scenario: Open the app locally

- **WHEN** the user opens the app’s HTML entry point in a supported browser (via `file://` or a local static server)
- **THEN** the main diagram view and primary controls SHALL be visible on one page without a separate login or server round-trip for the graph

#### Scenario: No cloud dependency for core features

- **WHEN** the user edits nodes, edges, or loads bundled sample data
- **THEN** the system SHALL NOT require network access to external services to perform those actions (bundled assets and in-page logic only)

---

### Requirement: Node management

The system SHALL allow the user to add process nodes and remove nodes from the diagram. Each node SHALL have a stable identifier, a display label, and optional detail text used for inspection.

#### Scenario: Add a node

- **WHEN** the user invokes the add-node action and provides or accepts a generated label
- **THEN** a new node SHALL appear in the graph model and in the visualization

#### Scenario: Remove a node

- **WHEN** the user deletes a selected node
- **THEN** that node SHALL be removed and any edges incident to it SHALL be removed from the model and visualization

#### Scenario: Remove a node eliminates only edges connected to that node

- **WHEN** the user deletes a selected node that had one or more incident edges
- **THEN** every edge whose **from** or **to** references that node SHALL be removed from the model and visualization
- **AND** every edge whose endpoints are both remaining nodes SHALL remain in the model

#### Scenario: Remove one edge leaves other edges unchanged

- **WHEN** the user deletes a selected edge
- **THEN** only that edge SHALL be removed; all other edges SHALL retain the same endpoints and labels (unless separately edited)

---

### Requirement: Stable layout for surviving nodes

The system SHALL keep each remaining node’s **placement coordinates** unchanged when a **node** is deleted (after which incident edges are removed) or when an **edge** is deleted. Remaining nodes SHALL NOT be re-laid out or reordered purely as a consequence of that deletion. Replacing the entire diagram via **Load sample** or **Load JSON file** MAY assign fresh positions for all nodes using the configured layout algorithm.

#### Scenario: Peer node positions unchanged after deleting another node

- **WHEN** the diagram has at least two nodes with stored positions and the user deletes one selected node
- **THEN** each surviving node SHALL keep the same x/y placement it had immediately before the deletion (within rendering precision)

#### Scenario: Node positions unchanged after deleting an edge only

- **WHEN** the user deletes a selected edge and at least two nodes remain
- **THEN** every surviving node SHALL keep the same x/y placement it had immediately before the edge deletion (within rendering precision)

---

### Requirement: Edge management with labels

The system SHALL allow the user to create directed edges from one node to another and to delete edges. Each edge SHALL carry a text label representing a file name, asset name, or asset type. The user MUST be able to edit an edge’s label after creation.

#### Scenario: Add a labeled edge

- **WHEN** the user connects a source node to a target node and supplies a label (or default placeholder)
- **THEN** a directed edge SHALL appear in the visualization with that label shown along or near the edge

#### Scenario: Edit edge label

- **WHEN** the user selects an edge and changes its label text
- **THEN** the visualization and inspection views SHALL reflect the updated label

#### Scenario: Remove an edge

- **WHEN** the user deletes a selected edge
- **THEN** the edge SHALL be removed from the model and visualization while nodes remain unless separately deleted

---

### Requirement: Graph visualization

The system SHALL render the current node and edge set as a graph (nodes as distinct shapes, edges as directed connections) so that the overall flow is visually understandable on the same page.

#### Scenario: Update after edits

- **WHEN** the user adds, removes, or relabels nodes or edges
- **THEN** the graph visualization SHALL update to match the current model without requiring a full page reload

---

### Requirement: Graph draws correctly after model changes

The system SHALL render the graph in a way that completes successfully whenever the model contains drawable content: implementation errors (such as invalid SVG element or attribute names) MUST NOT prevent the graph from appearing after nodes are added or after valid data is loaded.

#### Scenario: Render succeeds after adding nodes

- **WHEN** the diagram was empty and the user adds one or more nodes
- **THEN** the render pipeline SHALL complete without throwing an exception
- **AND** the diagram area SHALL contain a visible graph element for each node in the model

#### Scenario: Render succeeds after load sample

- **WHEN** the user activates load-sample and the sample defines at least one node
- **THEN** the render pipeline SHALL complete without throwing an exception
- **AND** every node and every edge in the loaded model SHALL have a corresponding visible representation in the diagram (nodes as shapes, edges as directed connections with labels)

#### Scenario: Render succeeds after loading valid JSON file

- **WHEN** the user loads a valid v1 JSON file that defines at least one node
- **THEN** the render pipeline SHALL complete without throwing an exception
- **AND** the visible graph SHALL match the loaded node and edge counts

---

### Requirement: Node inspection

The system SHALL allow the user to select a node (e.g., by click) and view its details, including identifier, label, optional detail text, and a summary of connected incoming and outgoing edges with their labels.

#### Scenario: Inspect selected node

- **WHEN** the user clicks a node in the visualization
- **THEN** an inspection panel or region SHALL show that node’s fields and its incident edges in a readable form

#### Scenario: Clear or change selection

- **WHEN** the user selects a different node or clears selection
- **THEN** the inspection view SHALL update to match the newly selected node or show an empty state

---

### Requirement: Load diagram from local JSON file

The system SHALL allow the user to load diagram data from a JSON file chosen from the user’s machine using a file picker (or equivalent browser file API). The JSON SHALL follow the documented v1 format including `nodes` and `edges` collections. The system SHALL NOT perform automatic filesystem scanning or directory walks.

#### Scenario: Successful file load

- **WHEN** the user selects a valid v1 JSON file that matches the documented schema
- **THEN** the in-memory graph SHALL be replaced by the file contents and the visualization SHALL refresh

#### Scenario: Invalid file

- **WHEN** the user selects a file that is not valid JSON or does not match the expected structure
- **THEN** the system SHALL show a clear error message and SHALL retain the prior diagram state

#### Scenario: No implicit disk access

- **WHEN** the app is running
- **THEN** the system SHALL NOT read paths or directories beyond what the user explicitly selects via the file picker (no filesystem scanning)

---

### Requirement: Sample data for learning

The system SHALL provide a way to populate the diagram with sample nodes and edges without leaving the app (e.g., a “Load sample” control using inlined or bundled JSON) so learners can explore the tool immediately.

#### Scenario: Load sample

- **WHEN** the user activates the load-sample control
- **THEN** the graph SHALL be populated with a non-empty example pipeline and the visualization SHALL update

---

### Requirement: Explicit v1 scope boundaries

The following SHALL NOT be part of v1: user accounts or authentication, cloud sync or remote hosting requirements, database persistence, automatic detection of files or assets on disk, and integration with external pipeline or CI systems.

#### Scenario: Scope guard

- **WHEN** a user attempts to use features outside this scope (e.g., expects live repo scanning)
- **THEN** those features SHALL remain unavailable and the app SHALL remain functional for in-scope editing and visualization only
