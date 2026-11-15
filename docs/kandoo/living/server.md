# Shared server

- Server choice: verified
- Host / public IPv4 / SSH user and port: 82.39.165.56 (user: root, port: 22)
- SSH fingerprint and dedicated key login: verified (RSA 3072 `SHA256:LbHE+DY/KyuOIEcYNWcLbjwzD3fwWkMYBo6Rail8wPA`; dedicated ed25519 key `docs/kandoo/secrets/id_ed25519`)
- Domain choice / DNS evidence: `api.kiloapp.ir` (A record verified to `82.39.165.56`; no conflicting AAAA)
- Public HTTPS URL / TLS verification / renewal: `https://api.kiloapp.ir` (Let's Encrypt certificate valid through 2027-02-13; HTTP 308 redirect verified; readiness responder verified with HTTP/2 200)
- HTTP forward proxy / authentication checks / tunnel readiness: verified (Squid on port 3128; authentication required; HTTP 407 verified on anonymous/wrong credentials; HTTP and HTTPS CONNECT 200 verified directly and via local SSH tunnel on `127.0.0.1:31280`)
- Ignored secret file references: `docs/kandoo/secrets/credentials.md`, `docs/kandoo/secrets/id_ed25519`, `docs/kandoo/secrets/known_hosts`
- Verification evidence and pending work: server onboarded and verified; no pending server tasks

## Deployment and port ledger

| Owner | Deployment ID | Purpose | Remote address/port | Local forwarding port | Volume/site | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Shared Kandoo | proxy-squid | Authenticated HTTP forward proxy | 127.0.0.1:3128 / 82.39.165.56:3128 | 31280 (SSH tunnel) | /opt/kandoo/squid-passwd | Squid 6.14; auth verified (HTTP 200, HTTPS 200, anon 407) |
| Shared Kandoo | web-readiness | Shared API readiness endpoint | 10.0.1.1:8015 | none | /opt/kandoo/readiness | https://api.kiloapp.ir (HTTP/2 200) |
| Existing Server | coolify-proxy | Traefik reverse proxy & ACME | 0.0.0.0:80, 443 | none | /data/coolify/proxy | Traefik v3.6 live |
| Existing Server | workshop-db | PostgreSQL database | coolify:workshop-db:5432 | none | /opt/kandoo/pg-data | PostgreSQL 17.11-bookworm |
| Existing Server | coolify-core | Coolify control plane | 0.0.0.0:8000 | none | /data/coolify | Coolify 4.3.16 |
| Existing Server | workshop-blog | Workshop journal | 10.0.1.1:8014 | none | /srv/workshop-blog/current | Caddy live (`blog.kiloapp.ir`) |
