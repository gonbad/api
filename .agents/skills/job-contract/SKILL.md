---
name: job-contract
description: Formalize OpenAPI 3.0 specification, endpoint shapes, session endpoints, and Swagger UI contract.
---

# /job-contract

Read `AGENTS.md`, the four `docs/constitution/` documents and `docs/kandoo/living/profile.md`, `job.md`, `server.md` and `status.md`. Resolve active Project `ID` and `VERSION` from status; all paths are workspace-root paths. Read installed references `docs/kandoo/living/references/workflow.md` and `waha-architecture.md`, `docs/projects/ID/living/idea.md`, and submitted rounds in the open version.

Define the standardized REST API specification inspired by WAHA and Telegram Bot API. Specify:
1. Session management endpoints (`GET /api/sessions`, `POST /api/sessions`, `GET /api/sessions/{session}`, `POST /api/sessions/{session}/logout`, `POST /api/sessions/{session}/stop`).
2. Authentication endpoints matching the platform's flow (e.g. `POST /api/sessions/{session}/auth/request-code` and `POST /api/sessions/{session}/auth/submit-code` for OTP).
3. Messaging and chat endpoints (`GET /api/{session}/chats`, `GET /api/{session}/chats/{chatId}/messages`, `POST /api/{session}/chats/{chatId}/messages/text`, `POST /api/{session}/chats/{chatId}/messages/media`).
4. Webhook event structures (`session.status`, `message`, `message.ack`).
5. OpenAPI 3.0 schema contract and interactive Swagger UI interface.

Write `docs/projects/ID/living/contract.md` and a clean OpenAPI 3.0 JSON specification in `projects/ID/contract/openapi.json`. Resolve open choices via `docs/projects/ID/versions/VERSION/NN-questions.md` in Obsidian; once submitted, hand off directly to `/job-mechanism`.

Apply the file-review/certainty protocol on `.md` files inside `docs/` and assess updates to the four domains. Persist changes in `docs/projects/ID/living/status.md` and mirror `docs/kandoo/living/status.md`. Finish with the full pipeline progress bar and one exact next action (`/job-mechanism` or the pending question file).
