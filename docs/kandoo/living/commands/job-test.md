---
name: job-test
description: Verify API endpoints, session persistence, OTP login, and webhook events, securing owner artifact acceptance.
---

# /job-test

Read `AGENTS.md`, the four `docs/constitution/` documents and `docs/kandoo/living/profile.md`, `job.md`, `server.md` and `status.md`. Resolve active Project `ID` and `VERSION` from status; all paths are workspace-root paths. Read installed references `docs/kandoo/living/references/workflow.md` and `quality.md`, `docs/projects/ID/living/architecture.md`, and submitted rounds.

Execute comprehensive end-to-end testing against the running gateway:
1. **OpenAPI & Swagger Validation**: Confirm Swagger UI loads, displays all endpoints, and OpenAPI JSON passes schema validation.
2. **Session Lifecycle Test**:
   - Create a test session. Verify status changes to `AWAITING_AUTH`.
   - Submit OTP code (using test credentials from gitignored secrets). Verify transition to `WORKING`.
3. **Messaging & Webhook Verification**:
   - Send a test message via `POST /api/{session}/chats/{chatId}/messages/text`. Confirm receipt on platform.
   - Send an incoming message from another account; verify the configured webhook receives the event payload.
4. **Session Persistence**: Restart the service and verify active sessions remain `WORKING` without re-authenticating.
5. **Owner Artifact Acceptance**:
   - Present test evidence in `docs/projects/ID/versions/VERSION/01-test-round.md`.
   - The participant reviews the live preview/Swagger UI, verifies operation, and explicitly signs off acceptance in Obsidian. Technical passing tests alone do not substitute for human acceptance.

Record results in `docs/projects/ID/versions/VERSION/01-test-round.md`. Once accepted by the owner, hand off directly to `/job-deploy`.

Apply the file-review/certainty protocol on `.md` files inside `docs/` and assess updates to the four domains. Persist changes in `docs/projects/ID/living/status.md` and mirror `docs/kandoo/living/status.md`. Finish with the full pipeline progress bar and one exact next action (`/job-deploy` or the pending test review file).
