## ADDED Requirements

### Requirement: Beginner-oriented repo overview

The project SHALL maintain a root-level `NOTES.md` file that explains this repository as a learning project for Git, GitHub, and OpenSpec.

#### Scenario: Reader opens NOTES.md

- **WHEN** a reader opens `NOTES.md` in the repository root
- **THEN** the file SHALL briefly state the purpose of `my_first_project` as a practice/learning workspace
- **AND** SHALL describe Git in terms of local history (repository, commits, branches) as it applies to this folder

#### Scenario: Reader learns GitHub’s role

- **WHEN** the reader reads the GitHub section
- **THEN** `NOTES.md` SHALL explain that GitHub hosts a remote copy of the repo
- **AND** SHALL relate common actions (e.g. push, pull, viewing history on the website) to why you use GitHub with this project

#### Scenario: Reader learns OpenSpec’s role in this repo

- **WHEN** the reader reads the OpenSpec section
- **THEN** `NOTES.md` SHALL explain that OpenSpec supports spec-driven changes (e.g. proposal, design, specs, tasks under `openspec/changes/`)
- **AND** SHALL mention that editor/agent commands like `/opsx:propose` are shortcuts to scaffold and fill those artifacts

#### Scenario: Orientation without external dependency

- **WHEN** the reader has no network access
- **THEN** `NOTES.md` SHALL still be understandable on its own
- **AND** MAY include optional links to official documentation for follow-up reading
