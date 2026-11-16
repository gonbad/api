# 001-eitaa: Gateway Architecture & Implementation

This document details the implemented production codebase, software components, session lifecycle manager, database persistence layer, and containerization configuration for Project 001-eitaa.

---

## 1. System Architecture Overview

```
                                      ┌────────────────────────────────────────────────┐
                                      │              External AI Agents / HTTP Clients │
                                      └───────────────────────┬────────────────────────┘
                                                              │ HTTP + X-Api-Key / Bearer
                                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Eitaa Bridge Gateway (Node.js / Express on Port 8016)                                                │
│                                                                                                       │
│   ┌─────────────────────────────┐        ┌─────────────────────────────┐                              │
│   │   Swagger UI & OpenAPI      │        │    Auth & Security Guard    │                              │
│   │   /docs & /api/docs/json    │        │    (Master & Session Keys)  │                              │
│   └─────────────────────────────┘        └──────────────┬──────────────┘                              │
│                                                         │                                             │
│                                                         ▼                                             │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  Express Endpoint Routers                                                                     │   │
│   │  ├── /api/health                                                                              │   │
│   │  ├── /api/sessions (Create, Start, Stop, Logout, Delete, List)                               │   │
│   │  ├── /api/sessions/{session}/auth (Request-Code, Submit-Code, Submit-Password)                │   │
│   │  ├── /api/{session}/chats (Unified List & Metadata Resolution)                                │   │
│   │  ├── /api/{session}/channels (Dedicated Broadcast Convenience Endpoints)                      │   │
│   │  ├── /api/{session}/groups (Dedicated Group Convenience Endpoints)                           │   │
│   │  └── /api/{session}/chats/{chatId}/messages (History, Text, Media)                           │   │
│   └─────────────────────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                                 │                                                     │
│                                                 ▼                                                     │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  Session Lifecycle Manager (`app/services/sessionManager.js`)                                 │   │
│   │  ├── In-Memory Client Registry (Multi-tenant)                                                 │   │
│   │  ├── Sticky Server Transport Cache                                                            │   │
│   │  ├── Entity Resolver (Numeric ID & @username to access_hash)                                  │   │
│   │  └── Outbound Webhook Dispatcher (`app/services/webhookDispatcher.js`)                        │   │
│   └──────────────────────┬──────────────────────────────────────────────┬─────────────────────────┘   │
│                          │                                              │                             │
│                          ▼                                              ▼                             │
│   ┌──────────────────────────────────────────────┐  ┌─────────────────────────────────────────────┐   │
│   │  PostgreSQL Layer (`app/db/`)                │  │  MTProto Protocol Engine (`app/engine/`)    │   │
│   │  ├── `sessions` (Tokens, Status, IMEIs)      │  │  ├── Layer 133 TL Serializer / Builder      │   │
│   │  ├── `entities` (access_hash, Usernames)     │  │  ├── `eitaaObject` Outer Envelope           │   │
│   │  └── `sync_diffs` (Timeline Sequences)       │  │  ├── Auto Token Refresh (`eitaaRefresh`)   │   │
│   │  └── Persistent Local Fallback (`data/`)     │  │  └── 10-Server HTTPS Octet-Stream Transport │   │
│   └──────────────────────────────────────────────┘  └──────────────────────┬──────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┼──────────────────────────┘
                                                                             │ HTTPS Octet-Stream
                                                                             ▼
                                                      ┌────────────────────────────────────────────────┐
                                                      │ Eitaa Datacenter Edge Pool                     │
                                                      │ (hasan.eitaa.ir, hosna, kazem, majid, ...)     │
                                                      └────────────────────────────────────────────────┘
```

---

## 2. Core Codebase Modules

### 2.1 Engine (`projects/001-eitaa/app/engine/`)
- **`src/client.js`**: High-level Eitaa client handling MTProto connection states, token propagation, auto-refresh triggers (`mt_eitaa_token_updating`), and methods (`sendCode`, `signIn`, `getMe`, `getChats`, `sendMessage`, `sendPhoto`, `resolveUsername`).
- **`src/transport/index.js`**: Obfuscated binary transport over HTTPS POST. Features sticky server affinity (`serverUrl`) to ensure session token and code verification consistency across requests, with automatic failover across 10 production datacenter endpoints.
- **`src/rpc/index.js`**: Wraps TL-serialized bytes into Eitaa's proprietary `eitaaObject` envelope (`token`, `imei`, `packed_data`, `layer: 133`, `flags: 32`).

### 2.2 Persistence & Entity Repository (`projects/001-eitaa/app/db/`)
- **`index.js`**: Manages PostgreSQL connection pool (`pg`) and runs automatic table creation migrations (`sessions`, `entities`, `sync_diffs`). Falls back seamlessly to persistent JSON volume storage (`/data/db_fallback.json`) if `DATABASE_URL` is unavailable.
- **`sessionRepository.js`**: CRUD persistence for sessions (tokens, IMEIs, sticky server URLs, status, user profiles, and timestamps).
- **`entityRepository.js`**: High-speed entity cache indexing `(session_name, entity_id)` and `@username` handles to platform `access_hash` values. Automatically pre-warmed whenever dialogs or messages are retrieved.

### 2.3 Session Manager & Webhook Dispatcher (`projects/001-eitaa/app/services/`)
- **`sessionManager.js`**: Central multi-session coordinator. Manages session lifecycles (`STOPPED`, `STARTING`, `AWAITING_OTP`, `AWAITING_PASSWORD`, `WORKING`, `FAILED`), sticky edge routing, phone OTP dispatch, code verification, 2FA cloud passwords, and dialogue querying.
- **`webhookDispatcher.js`**: Dispatches fire-and-forget outbound HTTP POST events (`session.status` and `message.created`) with a 5000ms timeout and warning logging.

### 2.4 Middleware & Routers (`projects/001-eitaa/app/routes/` & `middleware/`)
- **`auth.js`**: Validates `X-Api-Key` and `Authorization: Bearer <key>` headers against `GLOBAL_API_KEY`.
- **`health.js`**: Unauthenticated health probe (`GET /api/health`).
- **`sessions.js`**: Provisioning, starting, stopping, logging out, and deleting sessions.
- **`auth.js`**: Phone OTP request, code verification, and 2FA password endpoints.
- **`chats.js`**: Unified `/api/:session/chats` and `/api/:session/chats/:chatId/messages/*`.
- **`channels.js` & `groups.js`**: Dedicated convenience routers for channel broadcasts and group chat posting.

---

## 3. Containerization & Deployment Setup

- **`Dockerfile`**: Lightweight Node 20-alpine container with `curl` healthcheck, running as unprivileged `node` user with exposed port `8016`.
- **`docker-compose.yml`**: Configured with persistent named volume `eitaa-bridge-data:/data`, PostgreSQL connectivity to `workshop-db`, external `coolify` Docker network, and Traefik reverse proxy labels routing `eitaa.api.kiloapp.ir` with automated Let's Encrypt TLS.

---

## 4. Local Build & Startup Evidence

1. **Service Startup**:
   - Initialized via `PORT=8016 node app/server.js`.
   - Pre-seeded verified live session `default` from `.auth_state.json`.
   - Auto-started session `default` and connected to Eitaa production servers.
2. **Endpoint Verification**:
   - `GET /api/health` -> HTTP 200 `{ status: "ok", uptimeSeconds: 19, database: "fallback-local", version: "0.1.0" }`.
   - `GET /api/sessions` -> HTTP 200 returning session `default` (`status: "WORKING"`, user: `@konkooria_admin`, `userStatusOnline`).
   - `GET /api/default/chats?limit=5` -> HTTP 200 returning 27 dialogues (including "کارگاه MVP با هوش مصنوعی", "دیوار کنکوریا", "خبرگزاری تسنیم").
   - `GET /api/default/channels?limit=3` -> HTTP 200 returning channel entities.
