# Notes — `my_first_project`

This repository is a **small, intentional sandbox** for learning **Git** (version control on your machine), **GitHub** (sharing and backing up that history online), and **OpenSpec** (a **spec-driven** way to plan changes before you implement them). Nothing here is meant to be production software; the point is to practice the workflow.

---

## What lives in this repo?

| What | Why it matters |
|------|----------------|
| `readme.txt` | A tiny sample file you can edit, commit, and push to see Git/GitHub in action. |
| `.gitignore` | Tells Git which files **not** to track (logs, secrets, build artifacts, etc.). |
| `openspec/config.yaml` | OpenSpec project settings (this project uses the **spec-driven** schema). |
| `openspec/changes/<name>/` | Each **change** is a folder with artifacts like `proposal.md`, `design.md`, `specs/`, and `tasks.md` — your plan before coding. |
| `.cursor/`, `.github/`, etc. | Shortcuts and skills so assistants can run the same OpenSpec flows (e.g. propose → apply). |

You will spend most of your “learning time” in three places: the **working tree** (files you edit), **Git history** (commits), and optionally **GitHub** (remote).

---

## Git (on your computer)

**Git** records **snapshots** of your project over time.

- **Repository (repo):** This folder with a `.git` directory — Git’s database of commits, branches, and history.
- **Commit:** A saved snapshot with a message. Commits form a timeline you can compare, restore, or share.
- **Branch:** A movable pointer (often `main`) so you can try ideas without losing a known-good state.
- **Working tree:** The actual files you see; **staging** selects which changes go into the *next* commit.

Typical loop: edit files → **stage** → **commit** locally. You can do all of that **without** GitHub.

Official introduction: [https://git-scm.com/doc](https://git-scm.com/doc)

---

## GitHub (on the web)

**GitHub** hosts a **remote** copy of your Git repository.

- **Remote:** A named URL (often `origin`) pointing at GitHub’s copy of your repo.
- **Push:** Upload your new commits to GitHub so others (or you on another machine) can see them.
- **Pull / fetch:** Download updates from GitHub and integrate them with your local repo.

Use GitHub when you want **backup**, **collaboration**, **issues/pull requests**, or a **public** place to show your learning project.

Official docs: [https://docs.github.com](https://docs.github.com)

---

## OpenSpec (planning changes in this repo)

**OpenSpec** structures work as **changes** with explicit artifacts so “what we’re doing” is written down before you touch code.

1. **Propose** — e.g. `/opsx:propose "Describe the change…"` creates a change under `openspec/changes/<name>/` and fills **proposal**, **design**, **specs**, and **tasks** (exact steps depend on your tooling).
2. **Specs** — Requirements (often with scenarios) say what “done” means.
3. **Apply** — e.g. `/opsx:apply` tracks implementing the tasks (checkboxes in `tasks.md`) until the change matches the spec.

In *this* repo, OpenSpec is configured for learning: you practice **writing the plan**, not shipping a large product.

Project config: `openspec/config.yaml`  
Example change from this workflow: `openspec/changes/add-notes-beginner-repo-guide/`

---

## Quick mental model

```text
You (local)                GitHub (remote)
-----------                ---------------
edit files      push  -->  same history,
commit locally  pull <--   backed up & shareable

OpenSpec (in-repo)
------------------
propose → clarify tasks/specs → apply → commit & push like any other change
```

Welcome aboard — use this repo to break things safely, read the error messages, and build muscle memory for Git, GitHub, and spec-driven habits.
