# Shared server

- Server choice: onboarding in progress
- Host / public IPv4 / SSH user and port: pending participant input in ignored secrets
- SSH fingerprint and dedicated key login: pending credentials
- Domain choice / DNS evidence: pending participant input
- Public HTTPS URL / TLS verification / renewal: unverified
- HTTP forward proxy / authentication checks / tunnel readiness: unverified
- Ignored secret file references: docs/kandoo/secrets/credentials.md
- Verification evidence and pending work: awaiting initial credentials in docs/kandoo/secrets/credentials.md

`none` is a completed, valid answer for local-only work: set server, DNS, TLS and proxy
to `none` together. Later additions reuse the shared infrastructure procedure.

## Deployment and port ledger

| Owner | Deployment ID | Purpose | Remote address/port | Local forwarding port | Volume/site | Evidence |
| --- | --- | --- | --- | --- | --- | --- |

Do not guess free ports or reuse another Project's deployment. Record the proxy and
shared web service here, followed by each Project allocation. Credentials stay ignored.
