## Context

This is a small learning sandbox (`my_first_project`) initialized with Git, connected to GitHub for remote backup and collaboration, and configured with OpenSpec helpers under `.cursor/`, `.github/`, and similar folders. The repo already contains `openspec/config.yaml` and agent/command scaffolding; `NOTES.md` should tie those pieces together for a beginner audience without duplicating full tool documentation.

## Goals / Non-Goals

**Goals:**

- One root-level `NOTES.md` that answers: “What is this repo?” and “How do Git, GitHub, and OpenSpec show up here?”
- Use short sections, minimal jargon, and pointers to official docs where depth is needed.
- Mention the real files learners will touch (`readme.txt`, `.gitignore`, `openspec/`, change folders under `openspec/changes/`).

**Non-Goals:**

- Replace a full Git/GitHub/OpenSpec tutorial or course.
- Change application code, CI, or OpenSpec schema configuration.

## Decisions

- **Single file at repo root (`NOTES.md`)** — Easy to discover; matches the user’s request and keeps scope small.
- **Audience: true beginners** — Prefer definitions (“repository”, “commit”, “remote”) over shorthand; keep the file skimmable with clear headings.
- **OpenSpec described in workflow terms** — Explain propose → artifacts → apply at a high level so `/opsx:propose` and related commands make sense in context.

## Risks / Trade-offs

- **Docs drift** — If the repo layout changes, `NOTES.md` can become outdated. **Mitigation**: Keep descriptions tied to stable concepts (Git/GitHub/OpenSpec) and only name paths that are unlikely to move.

## Migration Plan

- Not applicable (documentation-only).

## Open Questions

- None.
