---
name: job-mechanism
description: Research, inspect, and compare implementation mechanisms (library vs Playwright vs frontend API) with options and recommendation.
---

# /job-mechanism

Read `AGENTS.md`, the four `docs/constitution/` documents and `docs/kandoo/living/profile.md`, `job.md`, `server.md` and `status.md`. Resolve active Project `ID` and `VERSION` from status; all paths are workspace-root paths. Read installed references `docs/kandoo/living/references/workflow.md` and `protocol-evaluation.md`, `docs/projects/ID/living/contract.md`, and submitted rounds in the open version.

Evaluate the implementation mechanism for communicating with the platform:
1. **Candidate code inspection**: If candidate code exists (such as `../eBot` or drop files in `projects/ID/existing/`), inspect it objectively. Check whether it implements a valid protocol layer (e.g. MTProto, TL schemas, socket/HTTP transport), whether it is broken, whether dependencies are intact, or whether it wraps web calls. Never assume candidate code works without inspection.
2. **Mechanism comparison**: Rigorously compare the three primary mechanisms:
   - Option A: Dedicated protocol library (adapted from candidate code or new implementation).
   - Option B: Internal frontend API reverse engineering (inspecting web client network calls).
   - Option C: Headless browser automation (Playwright/Puppeteer).
3. **Formulate Recommendation & Question Round**: Present the concrete trade-offs, resource footprints, anti-bot resilience, and maintainability in `docs/projects/ID/versions/VERSION/NN-questions.md`. Give a clear AI recommendation with reasoning and let the user decide.

Write `docs/projects/ID/living/mechanism.md` documenting the findings and evaluation. Once the question round is submitted, record the confirmed choice in the living document and hand off directly to `/job-auth`.

Apply the file-review/certainty protocol on `.md` files inside `docs/` and assess updates to the four domains. Persist changes in `docs/projects/ID/living/status.md` and mirror `docs/kandoo/living/status.md`. Finish with the full pipeline progress bar and one exact next action (`/job-auth` or the pending question file).
