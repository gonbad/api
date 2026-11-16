# Shared Infrastructure & Server Deployment

## Shared Server Architecture
- Host: `82.39.165.56` (Ubuntu Linux)
- Domain wildcard: `*.api.kiloapp.ir` resolves to `82.39.165.56`
- Reverse Proxy: Traefik on Docker (`coolify-proxy`), handling HTTP (80) and HTTPS (443) with automatic Let's Encrypt TLS certificates.
- Dedicated SSH Key: `docs/kandoo/secrets/id_ed25519` with verified unattended login for user `root`.
- Forward Proxy: Squid running on port 3128 for outbound external network access when needed.

## Subdomain & Deployment Rules
1. Every Project under the `api-bridge` Job is deployed to a dedicated subdomain:
   - Project `001-eitaa` -> `eitaa.api.kiloapp.ir`
   - Future projects -> `<slug>.api.kiloapp.ir`
2. Traefik Routing Configuration:
   - Each project container defines Traefik labels in `docker-compose.yml`:
     - `traefik.enable=true`
     - `traefik.http.routers.<slug>.rule=Host(\`<slug>.api.kiloapp.ir\`)`
     - `traefik.http.routers.<slug>.entrypoints=https`
     - `traefik.http.routers.<slug>.tls.certresolver=letsencrypt` (or production resolver)
     - `traefik.http.services.<slug>.loadbalancer.server.port=<INTERNAL_PORT>`
3. Session Storage & Volumes:
   - Session tokens, auth keys, and state files must be stored in named or bind-mounted persistent volumes (e.g. `/opt/kandoo/<slug>-data` or `projects/ID/data/`).
4. Port Ledger:
   - Maintain allocated internal ports and deployment IDs in `docs/kandoo/living/server.md`.
5. Session Credentials & Key Script:
   - Session API keys and auth pairs must remain gitignored.
   - Script `kandoo/scripts/generate-session-key.sh` handles generating session credentials remotely and storing them in the project's gitignored credentials file.
