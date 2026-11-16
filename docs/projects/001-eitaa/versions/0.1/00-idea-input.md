# Idea input / ورودی ایده پروژه اول

This document is prefilled with all facts, requirements, and decisions captured during your voice intake and specification rounds. You may freely edit, refine, or add details. Save the file and say `done` in chat or invoke the first Job step directly.

---

## 1. Confirmed Facts from Intake

- **Platform Target**: Eitaa messenger (پیام‌رسان ایتا). Eitaa lacks an official developer bot API for personal user accounts, requiring a bridge so agents and automated workflows can interact on behalf of real accounts.
- **Primary Use Case**: Enable AI agents (e.g. conversational sales agents, support assistants) and developers to connect to Eitaa via standard REST calls, read incoming messages, and reply to chats.
- **Architectural Reference**:
  - **WAHA (WhatsApp HTTP API, `https://waha.devlike.pro/`)**: Session lifecycle management, Swagger UI / OpenAPI 3.0 specification (`/api/docs/json`), clean REST endpoints, and outbound webhook delivery.
  - **Telegram Bot API**: Familiar messaging endpoints, update polling / webhook formats, and event payloads.
- **Session Management**:
  - Multi-session architecture: multiple independent Eitaa accounts can be hosted simultaneously.
  - Each session has a unique `session_id` and an authorization `api_key`.
  - Sessions can be dynamically started, inspected, stopped, or logged out.
- **Authentication Flow**:
  - Phone number submission -> Eitaa delivers OTP verification code -> OTP submitted -> session state transitions to `WORKING` (logged in).
  - Handles two-factor authentication (2FA) if enabled on the account.
- **Core Operations**:
  - `GET /api/sessions` & `POST /api/sessions`: Manage session instances.
  - `POST /api/sessions/{session}/auth/request-code` & `submit-code`: Request and verify OTP.
  - `GET /api/{session}/chats`: List conversations and unread counts.
  - `GET /api/{session}/chats/{chatId}/messages`: Retrieve message history.
  - `POST /api/{session}/chats/{chatId}/messages/text`: Send text message.
  - `POST /api/{session}/chats/{chatId}/messages/media`: Send media attachments.
  - Webhooks for incoming events (`session.status`, `message`).
- **Domain & Deployment**:
  - Subdomain: `https://eitaa.api.kiloapp.ir` on shared server `82.39.165.56`.
  - Reverse proxy: Traefik on Docker with automated Let's Encrypt TLS certificate.
  - Port & volumes recorded in `docs/kandoo/living/server.md`.
- **Security & Portability**:
  - Public repository remains portable and open-source ready (no private server credentials in Git).
  - Session keys and secrets stored in gitignored files (`docs/projects/001-eitaa/secrets/credentials.md`).
  - Helper script `kandoo/scripts/generate-session-key.sh` provisions session keys over SSH.

---

## 2. Technical Investigation Strategy (Delegated to `job-mechanism` and `job-auth`)

- **Candidate Code**: Sibling directory `../eBot` contains an unverified Eitaa client library. We will not assume it works or that it is full MTProto; we will inspect its source, dependencies, and network calls objectively during `job-mechanism`.
- **Comparison Options**:
  1. Option A: Adapt or repair the client library from `../eBot`.
  2. Option B: Reverse-engineer Eitaa's internal web client HTTP/WebSocket API.
  3. Option C: Headless browser automation via Playwright.
- **Next Decision**: Compare trade-offs (memory, reliability, anti-bot, maintenance) in `job-mechanism` and present a structured recommendation for confirmation.
