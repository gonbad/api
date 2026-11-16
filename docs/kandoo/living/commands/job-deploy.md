---
name: job-deploy
description: Deploy gateway to shared server, configure Traefik routes and TLS certificates, and verify live HTTPS.
---

# /job-deploy

Read `AGENTS.md`, the four `docs/constitution/` documents and `docs/kandoo/living/profile.md`, `job.md`, `server.md` and `status.md`. Resolve active Project `ID` and `VERSION` from status; all paths are workspace-root paths. Read installed references `docs/kandoo/living/references/workflow.md`, `infrastructure.md`, and `quality.md`. Require explicit owner acceptance from `/job-test`.

Deploy the gateway to the shared VPS server:
1. **Server Provisioning**:
   - Transfer or sync application container definitions (`Dockerfile`, `docker-compose.yml`) to `/opt/kandoo/projects/<ID>/` on the server using the verified SSH key.
   - Allocate a unique internal port and persistent volume for session storage.
2. **Traefik Routing & TLS Certificates**:
   - Configure Traefik router rules for `Host(\`<subdomain>.api.kiloapp.ir\`)`.
   - Ensure ACME Let's Encrypt TLS resolver is active and issue publicly trusted TLS certificate for the subdomain.
   - Verify HTTPS redirect and certificate validity from both external networks and the participant's environment.
3. **Ledger & Status Update**:
   - Update the deployment and port ledger in `docs/kandoo/living/server.md` with the new deployment ID, subdomain URL, internal port, and persistent volume.
4. **Git Tagging & Release Notes**:
   - Create Git release tag `project/ID/release/VERSION` (e.g. `project/001-eitaa/release/0.1`).
   - Write `docs/projects/ID/versions/VERSION/deploy-notes.md` with verified live HTTPS Swagger URL, endpoints summary, and health checks.

Apply the file-review/certainty protocol on `.md` files inside `docs/` and assess updates to the four domains. Persist changes in `docs/projects/ID/living/status.md` and mirror `docs/kandoo/living/status.md`. Finish with the full pipeline progress bar showing all steps done and the terminal next action.
