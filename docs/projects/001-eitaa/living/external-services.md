# 001-eitaa External Services & Dependencies

This document details the external service dependencies, runtime environment variables, and credential boundaries for Project 001-eitaa.

---

## 1. External Service Dependencies

| Service / Dependency | Role | Network / Access Target | Protocol |
| --- | --- | --- | --- |
| **Eitaa Messaging Platform** | Target platform for user, group, and channel operations | `eitaa.com` / MTProto servers | TLS / WSS / TCP |
| **PostgreSQL Database** | Persistent session storage, auth keys, and state diffs | Shared server `workshop-db` (`10.0.1.1:5432` / local bridge) | PostgreSQL wire protocol |
| **Traefik Reverse Proxy** | Public HTTPS entry point & automatic TLS certificates | `82.39.165.56` (Docker bridge `coolify`) | HTTP / HTTPS (80 / 443) |
| **Webhook Target(s)** | Agent endpoint receiving incoming events | Configured per session or environment | Outbound HTTP POST |
| **Squid Forward Proxy** *(Optional)* | Outbound proxy for isolated external network calls | `127.0.0.1:3128` (or SSH tunnel `31280`) | HTTP CONNECT |

---

## 2. Environment Variables

These variables configure the running gateway service container:

| Variable | Description | Example / Default | Required |
| --- | --- | --- | --- |
| `PORT` | Local service listening port inside container | `8016` | Yes |
| `BASE_URL` | Publicly reachable base URL for Swagger and links | `https://eitaa.api.kiloapp.ir` | Yes |
| `DATABASE_URL` | PostgreSQL connection string for session and diff storage | `postgres://user:pass@workshop-db:5432/eitaa_bridge` | Yes |
| `GLOBAL_API_KEY` | Master administrative API key for `/api/sessions` | Stored in ignored credentials | Yes |
| `DATA_DIR` | Directory path for local media cache and temporary files | `/data` | Yes |
| `WEBHOOK_URL` | Default outbound webhook listener URL | `https://example.com/webhook` | Optional |
| `LOG_LEVEL` | Application logging level | `info` (`debug` during dev) | Optional |
| `SQUID_PROXY_URL` | Outbound forward proxy connection string | `http://user:pass@127.0.0.1:3128` | Optional |

---

## 3. Credential Requirements & Security Boundary

> [!IMPORTANT]
> **Owner Instruction on Secrets**:
> Never commit actual passwords, session tokens, verification codes, or master API keys to Git, and never paste them in chat or public documentation.
> All actual secret values must be stored strictly in the gitignored file:
> `docs/projects/001-eitaa/secrets/credentials.md`
>
> That file is ignored at the workspace root via `.gitignore` (`**/secrets/`) and protected by repository security rules.
