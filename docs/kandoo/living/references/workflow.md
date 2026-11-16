# API Bridge Workflow across all seven stages

The `api-bridge` Job turns closed or unofficial platforms (messengers, web interfaces) into standardized, developer- and agent-friendly REST/OpenAPI APIs with multi-session management, inspired by WAHA and Telegram Bot API.

Expand three Project paths consistently from the workspace root: artifact root `projects/ID/`, document root `docs/projects/ID/`, and selected version dossier `docs/projects/ID/versions/VERSION/`. Every file the participant is asked to open, read or edit must be a `.md` file inside `docs/` (including gitignored `docs/projects/ID/secrets/credentials.md` for tokens; the only folder exceptions outside `docs/` are pasting an existing codebase into `projects/ID/existing/` or external designs into `projects/ID/design/`).

## Authoritative seven-stage handoff

| Command | Input artifact | Output artifact | Installed references | Exit evidence | Next |
| --- | --- | --- | --- | --- | --- |
| `job-idea` | Selected-version input recorded in `docs/projects/ID/living/status.md`, optional `projects/ID/existing/` | `docs/projects/ID/living/idea.md`, `roadmap.md`, `external-services.md` | `workflow.md` | Core platform scope, session model, agent use cases and target domain resolved | `job-contract` |
| `job-contract` | `docs/projects/ID/living/idea.md` | `docs/projects/ID/living/contract.md`, `openapi.json` / schema draft | `workflow.md`, `waha-architecture.md` | OpenAPI 3.0 specification, endpoint shapes, session endpoints, and Swagger UI contract resolved | `job-mechanism` |
| `job-mechanism` | `docs/projects/ID/living/contract.md`, optional code in `existing/` or sibling repos | `docs/projects/ID/living/mechanism.md`, `NN-questions.md` | `workflow.md`, `protocol-evaluation.md` | Library vs Playwright vs frontend API compared with trade-offs; choice submitted and confirmed | `job-auth` |
| `job-auth` | `docs/projects/ID/living/mechanism.md` | `docs/projects/ID/living/auth.md`, raw proof script in `projects/ID/scripts/` | `workflow.md`, `protocol-evaluation.md` | Login/OTP/QR authentication mechanism analyzed and raw login/session creation verified | `job-build` |
| `job-build` | `contract.md`, `mechanism.md`, `auth.md` | `projects/ID/app/`, `projects/ID/Dockerfile`, `docker-compose.yml` | `workflow.md`, `waha-architecture.md`, `infrastructure.md` | Service implementation, session manager, OpenAPI endpoints, and webhook dispatcher built | `job-test` |
| `job-test` | Running service + test sessions, test scenarios | `docs/projects/ID/versions/VERSION/NN-test-round.md` | `workflow.md`, `quality.md` | Interactive API tests, session lifecycle, message send/receive, and owner artifact acceptance | `job-deploy` |
| `job-deploy` | Owner acceptance, `docs/kandoo/living/server.md` | `docs/projects/ID/versions/VERSION/deploy-notes.md`, `project/ID/release/VERSION` | `workflow.md`, `infrastructure.md`, `quality.md` | Server deployment, Traefik route & Let's Encrypt TLS verification for `subdomain.api.kiloapp.ir` | Complete |

Keep living specs in `docs/projects/ID/living/` (`idea.md`, `contract.md`, `mechanism.md`, `auth.md`, `test-scenarios.md`, `architecture.md`, `roadmap.md`, `external-services.md`, `status.md`). Specification steps advance once open question rounds are submitted; live API product acceptance at `job-test` remains an explicit human sign-off.
