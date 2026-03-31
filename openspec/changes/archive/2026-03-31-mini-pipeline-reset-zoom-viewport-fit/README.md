# mini-pipeline-reset-zoom-viewport-fit

OpenSpec change: **Reset zoom** fits the **bounding box** of all Processes and Files in the viewport with a **margin**; **empty** diagram gets a **default** view; **viewport only**—no graph or layout mutation.

- `proposal.md` — rationale and scope  
- `design.md` — bbox, margin, `userAdjusted`, testability  
- `tasks.md` — implementation checklist  
- `specs/mini-pipeline-bipartite-v1/spec.md` — requirements  

Validate: `openspec validate mini-pipeline-reset-zoom-viewport-fit --strict`
