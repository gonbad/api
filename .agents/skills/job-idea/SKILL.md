---
name: job-idea
description: Scope platform target, session requirements, agent use cases, and deployment subdomain.
---

# /job-idea

Read `AGENTS.md`, the four `docs/constitution/` documents and `docs/kandoo/living/profile.md`, `job.md`, `server.md` and `status.md`. Resolve the active Project `ID` and `VERSION` from status; all paths are workspace-root paths. Read the installed reference `docs/kandoo/living/references/workflow.md`, the selected-version input recorded in `docs/projects/ID/living/status.md`, and submitted rounds in that version. Preserve earlier outputs and authorization.

Inspect `projects/ID/existing/` if the participant provided candidate code or an existing codebase. Clarify the product's core intent: turning an unsupported platform into a standardized REST/OpenAPI gateway with multi-session management (inspired by WAHA and Telegram Bot API). Identify target platform, session model (OTP/phone, QR, or token), agent use cases, and target subdomain under `*.api.kiloapp.ir`.

Cut version `0.1` to a core demonstrable journey (session creation, login, chat listing, sending messages, webhook events) and bank secondary features in `docs/projects/ID/living/roadmap.md`. Record external service dependencies, environment variable names, and credential requirements in `docs/projects/ID/living/external-services.md` (instructing the owner to store actual secrets only in gitignored `docs/projects/ID/secrets/credentials.md`).

Always write and maintain `docs/projects/ID/living/idea.md`. Resolve open questions via `docs/projects/ID/versions/VERSION/NN-questions.md` in Obsidian; once submitted, hand off directly to `/job-contract`.

Apply the file-review/certainty protocol on `.md` files inside `docs/` and assess updates to the Job, shared Kandoo, active Project and write-only creator feedback. Persist what changed, evidence, pending review and next action in `docs/projects/ID/living/status.md` and mirror `docs/kandoo/living/status.md`. Finish every reply with the current Job's full ordered steps localized and one exact next action (`/job-contract` or the pending `.md` question file).
