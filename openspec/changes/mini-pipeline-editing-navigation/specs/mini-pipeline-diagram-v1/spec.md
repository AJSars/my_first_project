## ADDED Requirements

### Requirement: Delete selected items from the UI

The system SHALL provide controls in the main interface to delete the **currently selected node** (and all edges incident to that node) and to delete the **currently selected edge**. The system SHALL also allow the user to trigger the same delete actions using the keyboard when a graph item is selected and the user is not typing in a form control.

#### Scenario: Delete selected node via control

- **WHEN** a node is selected and the user activates the delete-node control in the UI
- **THEN** that node SHALL be removed from the model and visualization
- **AND** every edge incident to that node (any edge whose **from** or **to** equals that node’s id) SHALL be removed
- **AND** no other edge SHALL be removed
- **AND** the prior selection SHALL be cleared or updated so no stale selection references removed items

#### Scenario: Delete selected edge via control

- **WHEN** an edge is selected and the user activates the delete-edge control in the UI
- **THEN** exactly that edge SHALL be removed from the model and visualization
- **AND** all other edges and all nodes SHALL remain unless separately deleted

#### Scenario: Delete selection via keyboard

- **WHEN** a node or edge is selected and the user presses **Delete** or **Backspace** while focus is not in a text field, select, or other editable control where the key is needed for text entry
- **THEN** the system SHALL apply the same effect as the corresponding delete control (node deletion including **all** incident edges, or **single** edge deletion only)
- **WHEN** no deletable selection exists
- **THEN** the key press SHALL NOT remove graph elements or throw an error

#### Scenario: Survivor nodes do not move when a node or edge is deleted

- **WHEN** the user deletes a selected node or a selected edge
- **THEN** every remaining node SHALL retain the same diagram coordinates it had before that deletion (no automatic re-layout of survivors solely due to the delete)

---

### Requirement: Zoom graph with modifier and wheel

The system SHALL support zooming the graph view using the **Control** key held together with the **mouse wheel** (or equivalent scroll delta) while the pointer is over the graph area. Zooming SHALL not depend on network access. The zoom operation SHOULD keep the point under the pointer stable in the diagram (pointer-centered zoom) when the implementation can compute coordinates reliably.

#### Scenario: Zoom in

- **WHEN** the user holds **Control** and scrolls the wheel forward over the graph (using the browser’s “zoom in” scroll direction)
- **THEN** the graph view SHALL render larger relative to the previous scale within allowed zoom limits
- **AND** the page SHALL remain a single local client-side app with no server round-trip

#### Scenario: Zoom out

- **WHEN** the user holds **Control** and scrolls the wheel backward over the graph within allowed zoom limits
- **THEN** the graph view SHALL render smaller relative to the previous scale

#### Scenario: Pointer-centered when practical

- **WHEN** the user zooms with **Control** + wheel and pointer-centered zoom is implemented
- **THEN** the diagram coordinate under the cursor SHALL remain approximately fixed on screen during the zoom step (subject to clamping at zoom bounds)

#### Scenario: No backend for zoom

- **WHEN** the user zooms
- **THEN** the system SHALL NOT send HTTP requests or open connections solely to perform zoom

#### Scenario: Zoom is smooth and does not drop graph selection

- **WHEN** a node is selected and the user zooms with **Control** + wheel over the graph one or more times
- **THEN** that node SHALL remain the selected node with inspection data still consistent (unless the user clicks elsewhere)
- **AND** the implementation SHALL avoid a full graph teardown solely for zoom so selection state is not reset by the zoom gesture itself

#### Scenario: Zoom does not invalidate edge label editing

- **WHEN** an edge is selected and its label field is shown for editing and the user zooms with **Control** + wheel over the graph
- **THEN** that edge SHALL remain selected and the edge-label editor SHALL remain usable with the same edge identity (unless the user changes selection separately)

---

### Requirement: Scope unchanged for extensions

The extensions in this delta SHALL NOT introduce a backend service, database persistence, user authentication, cloud sync, or integrations with external pipeline or CI systems beyond what Mini Pipeline Diagram Maker v1 already allows.

#### Scenario: Still local single page

- **WHEN** the user uses only deletion, zoom, and existing v1 features
- **THEN** the application SHALL remain usable as a single-page, local-only tool without mandatory login or remote API
