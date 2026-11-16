# WAHA & Telegram Bot API Architectural Reference

## 1. Multi-Session REST Gateway Pattern

Inspired by WAHA (WhatsApp HTTP API, `https://waha.devlike.pro/`), the gateway exposes a clean REST API and Swagger documentation / OpenAPI 3.0 specification (`/dashboard/`, `/api/docs/json`, `/api/docs/yaml`).

### Session Lifecycle States
Every session undergoes explicit lifecycle transitions:
- `STOPPED`: Session exists in configuration/storage but is not running.
- `STARTING`: Engine initialization and network connection in progress.
- `AWAITING_AUTH` (e.g. `SCAN_QR_CODE` or `AWAITING_OTP`): Waiting for user authentication (entering phone OTP or scanning QR).
- `WORKING`: Successfully authenticated and active; ready to receive commands and stream events.
- `FAILED`: Authentication failed, session terminated, or network fatal error.

### Core Endpoints Schema
1. **Session Management**:
   - `GET /api/sessions`: List all configured sessions with current status, phone number, and metadata.
   - `POST /api/sessions`: Create and start a new session (`{ name: string, config?: object }`).
   - `GET /api/sessions/{session}`: Get detailed session state, active profile, and engine information.
   - `POST /api/sessions/{session}/auth/request-code`: Request OTP code for phone login (where applicable).
   - `POST /api/sessions/{session}/auth/submit-code`: Submit received OTP code to complete login.
   - `POST /api/sessions/{session}/logout`: Terminate session and invalidate auth tokens.
   - `POST /api/sessions/{session}/stop`: Stop session engine.

2. **Messaging & Chats**:
   - `GET /api/{session}/chats`: List active chats/conversations with pagination and unread counts.
   - `GET /api/{session}/chats/{chatId}/messages`: Fetch recent message history for a chat.
   - `POST /api/{session}/chats/{chatId}/messages/text`: Send text message (`{ text: string }`).
   - `POST /api/{session}/chats/{chatId}/messages/media`: Send file, voice, photo, or document.

3. **Webhooks & Real-time Events**:
   - Outbound HTTP POST webhooks dispatched to configured URL on events:
     - `session.status`: Emitted whenever session status changes (`STARTING`, `WORKING`, `STOPPED`, etc.).
     - `message`: New incoming message received in any chat.
     - `message.ack`: Message delivery acknowledgment (sent, delivered, read).

4. **Agent Integration & Swagger**:
   - Self-hosted Swagger UI at root `/` or `/dashboard/`.
   - OpenAPI 3.0 JSON schema at `/api/docs/json`.
   - Authorization via `X-Api-Key` or Bearer header corresponding to the session's provisioned key.
