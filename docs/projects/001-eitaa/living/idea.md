# 001-eitaa: Eitaa REST/OpenAPI Gateway

Standardized, multi-session REST API gateway and Swagger UI for Eitaa messenger (پیام‌رسان ایتا), enabling AI agents and developers to interact with Eitaa user accounts, groups, and channels via clean HTTP endpoints and real-time outbound webhooks.

## 1. Product Intent & Core Model

Eitaa lacks an official developer bot API for personal user accounts, preventing AI agents (e.g., automated support, sales assistants, triage bots) and standard workflows from interacting directly with Eitaa users, channels, and groups.

This project delivers an open-source, multi-session HTTP gateway inspired by:
- **WAHA (WhatsApp HTTP API)**: Multi-session lifecycle management, OpenAPI 3.0 specification, live Swagger UI documentation, clean REST endpoints, and outbound webhook delivery.
- **Telegram Bot API**: Standardized message, chat, group, and channel object structures, predictable event formatting, and agent-friendly JSON payloads.

Each running instance manages multiple independent Eitaa user accounts concurrently. Every session is completely isolated with its own authentication state, session identifier, and optional security key.

---

## 2. Platform Target & Session Model

- **Platform Target**: Eitaa Messenger (`eitaa.com`).
- **Session Model**:
  - Multi-session architecture: Multiple accounts run in parallel on a single gateway instance.
  - Session Identifier: Each account instance has a unique `session_id` (e.g., `default`, `sales-rep-1`, `support-agent`).
  - Authentication Mechanism: Interactive phone number submission followed by SMS / in-app OTP verification code, with support for two-factor authentication (2FA) cloud passwords when configured.
  - Session Lifecycle States:
    - `STOPPED`: Session configured but inactive.
    - `STARTING`: Engine initializing network transport.
    - `AWAITING_OTP`: Waiting for verification code submission.
    - `AWAITING_PASSWORD`: Waiting for 2FA password submission.
    - `WORKING`: Authenticated, connected, and actively processing messages.
    - `FAILED`: Connection or auth error occurred.
- **Persistence & Storage Model**:
  - Relational database persistence using PostgreSQL (`workshop-db`).
  - Session auth keys, connection state, entity caches, and diff synchronizations are stored in PostgreSQL tables, allowing rapid diff querying and reliable state restoration across gateway container restarts.

---

## 3. Agent & Developer Use Cases

- **Autonomous Sales & Support Agents**: AI assistants can poll or receive webhooks for incoming customer chats, query knowledge bases or LLMs, and reply seamlessly through the user account.
- **Channel & Group Automation**: Automate publishing announcements to channels, monitoring discussions in group chats, and dispatching alerts to specific groups.
- **Workflow Automation**: Low-code tools (n8n, Node-RED) and backend microservices can dispatch notifications, order confirmations, and status updates via simple HTTP POST calls.
- **Two-Way Webhook Integration**: Outbound HTTP webhooks dispatch events (`session.status`, `message.created`) using WAHA-compatible JSON envelopes to configured listener URLs in real time.
- **Interactive Documentation**: Built-in Swagger UI at `/docs` allows immediate manual exploration and testing of every endpoint.

---

## 4. Demonstrable Core Journey (Version 0.1)

Version 0.1 incorporates direct conversations, channels, and groups into the demonstrable journey:

1. **Session Management**:
   - `GET /api/sessions`: List all configured sessions and their status.
   - `POST /api/sessions`: Create a new session instance.
   - `DELETE /api/sessions/{session}`: Log out and remove a session.

2. **Authentication Flow**:
   - `POST /api/sessions/{session}/auth/request-code`: Submit phone number to request OTP.
   - `POST /api/sessions/{session}/auth/submit-code`: Submit received OTP code.
   - `POST /api/sessions/{session}/auth/submit-password`: Submit 2FA cloud password if requested.

3. **Chats, Groups & Channels**:
   - `GET /api/{session}/chats`: List active chats, groups, and subscribed channels.
   - `GET /api/{session}/chats/{chatId}/messages`: Fetch recent message history for a conversation, group, or channel.
   - `POST /api/{session}/chats/{chatId}/messages/text`: Send text message to a user, group, or channel.
   - `POST /api/{session}/chats/{chatId}/messages/media`: Send media attachments (image/file) to a user, group, or channel.

4. **Webhooks & Events**:
   - Outbound HTTP POST notifications for `session.status` changes and incoming `message.created` (with session ID and chat context).

5. **API Documentation**:
   - Interactive Swagger UI at `/docs` and raw OpenAPI 3.0 specification at `/api/docs/json`.

One-time administrative actions (profile bio, avatar, account privacy settings) and advanced capabilities (proxy rotation, audio transcoding) are banked in `docs/projects/001-eitaa/living/roadmap.md`. Note: Message reactions are not currently supported by Eitaa.

---

## 5. Deployment & Domain Topology

- **Target Domain**: `https://eitaa.api.kiloapp.ir`
- **Shared Infrastructure**: Host VPS `82.39.165.56` (recorded in `docs/kandoo/living/server.md`).
- **Reverse Proxy & TLS**: Traefik with automated Let's Encrypt certificate issuance.
- **Database Backend**: PostgreSQL on shared server (`workshop-db`).
- **Service Container**: Docker Compose service mapped to allocated port `8016` on loopback.
- **Access Protection**: Gitignored API keys and master secrets stored strictly in `docs/projects/001-eitaa/secrets/credentials.md`.

---

## 6. Candidate Code & Mechanism Strategy

- Candidate code from `../eBot` is preserved in `projects/001-eitaa/existing/eBot`.
- As confirmed in Round 01 decisions:
  - **Primary**: Inspect and evaluate `existing/eBot` (Node.js MTProto client) in `job-mechanism`.
  - **Fallback**: If `eBot` is unviable or blocked by network/protocol changes, fall back to browser automation via Playwright.
