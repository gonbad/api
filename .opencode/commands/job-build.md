---
name: job-build
description: Implement the HTTP REST service, session manager, OpenAPI endpoints, authentication handler, and webhooks.
---

# /job-build

Read `AGENTS.md`, the four `docs/constitution/` documents and `docs/kandoo/living/profile.md`, `job.md`, `server.md` and `status.md`. Resolve active Project `ID` and `VERSION` from status; all paths are workspace-root paths. Read installed references `docs/kandoo/living/references/workflow.md`, `waha-architecture.md`, and `infrastructure.md`, `docs/projects/ID/living/contract.md`, `mechanism.md`, `auth.md`, and submitted rounds.

Implement the production gateway application in `projects/ID/`:
1. **Server & OpenAPI Core**: Express/Fastify/Node.js or Python service serving the interactive Swagger UI and valid OpenAPI 3.0 specification at `/api/docs/json`.
2. **Session Lifecycle Manager**:
   - Multi-session store tracking states (`STOPPED`, `STARTING`, `AWAITING_AUTH`, `WORKING`, `FAILED`).
   - Session persistence in local files/volume (`projects/ID/data/`).
   - Allowlist authorization: validate `(session_id, api_key)` pairs on incoming requests.
3. **Endpoint Handlers**:
   - Session creation, status lookup, and OTP request/submit handlers mapped to the verified authentication layer.
   - Messaging endpoints: chat listing, history retrieval, text sending, and media sending.
4. **Webhook Dispatcher**:
   - Asynchronous HTTP POST event dispatcher with retry and timeout for `session.status` and `message` events.
5. **Containerization**:
   - `projects/ID/Dockerfile` and `docker-compose.yml` with health checks, persistent volumes, and Traefik labels configured for the project's subdomain.

Write `docs/projects/ID/living/architecture.md` detailing the implemented codebase and components. Verify local build and container startup, then hand off directly to `/job-test`.

Apply the file-review/certainty protocol on `.md` files inside `docs/` and assess updates to the four domains. Persist changes in `docs/projects/ID/living/status.md` and mirror `docs/kandoo/living/status.md`. Finish with the full pipeline progress bar and one exact next action (`/job-test`).
