# api: API Bridge Gateway Kandoo

A configured Kandoo workspace for building standardized, developer- and agent-friendly REST/OpenAPI APIs and gateways for closed or unofficial messaging/web platforms, inspired by WAHA and Telegram Bot API.

## Architecture & Current Job
- **Job**: `api-bridge` (revision 0.1, documented in [job.md](docs/kandoo/living/job.md))
- **Active Project**: `001-eitaa` (Eitaa REST/OpenAPI Gateway, documented in [idea.md](docs/projects/001-eitaa/living/idea.md))
- **Shared Infrastructure**: Ubuntu VPS `82.39.165.56`, automated Let's Encrypt TLS via Traefik reverse proxy, Squid forward proxy on port 3128, and wildcard routing for `*.api.kiloapp.ir`.
- **Target Domain for Project 1**: `https://eitaa.api.kiloapp.ir`

## Ordered Job Pipeline
Every platform bridge project follows a 7-stage pipeline:
1. `/job-idea`: Scope platform target, session requirements, agent use cases, and deployment subdomain.
2. `/job-contract`: Formalize OpenAPI 3.0 specification, endpoint shapes, session endpoints, and Swagger UI.
3. `/job-mechanism`: Research, inspect, and compare implementation mechanisms (library vs Playwright vs frontend API) with options and recommendation.
4. `/job-auth`: Research, compare, and verify platform authentication and login mechanisms (OTP vs QR vs tokens) with raw proof.
5. `/job-build`: Implement the HTTP REST service, session manager, OpenAPI endpoints, authentication handler, and webhooks.
6. `/job-test`: Verify API endpoints, session persistence, OTP login, and webhook events, securing owner artifact acceptance.
7. `/job-deploy`: Deploy gateway to shared server, configure Traefik routes and TLS certificates, and verify live HTTPS.

## Workspace Commands
- **Job Steps**: `/job-idea`, `/job-contract`, `/job-mechanism`, `/job-auth`, `/job-build`, `/job-test`, `/job-deploy`
- **Permanent Kandoo Commands**:
  - `/kandoo-new-project`: Create and select the next independent platform bridge.
  - `/kandoo-switch`: Resume an existing platform bridge project.
  - `/kandoo-add-idea`: Bank a spontaneous feature idea into the active Project or shared Kandoo roadmap.
  - `/kandoo-iterate`: Open a planned new version for the active Project.
  - `/kandoo-issue`: Diagnose, fix, and verify a defect in the active Project or shared Kandoo.
  - `/kandoo-server`: Verify or update shared server, Traefik, DNS, and proxy infrastructure.

## Vault Layout (`docs/`)
Open the `docs/` folder as an Obsidian vault. All participant review, decisions, and instructions live as Markdown in `docs/`:
- `docs/kandoo/living/`: Shared profile, server facts, installed Job, and status.
- `docs/projects/001-eitaa/living/`: Current Project living idea, architecture, roadmap, and status.
- `docs/projects/001-eitaa/versions/0.1/`: Open version inputs, question rounds, and test reports.
- `docs/projects/001-eitaa/secrets/`: Gitignored credentials and provisioned session keys.

## Host Discovery
- **Claude Code / OpenCode**: `/NAME` commands located in `.claude/commands/` and `.opencode/commands/`.
- **Codex / Antigravity**: Skills located in `.agents/skills/NAME/SKILL.md` (shared copies).
