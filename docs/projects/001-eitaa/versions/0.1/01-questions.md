# Questions and decisions: Version 0.1 / Round 01

## 1. Webhook payload formatting standard
Kind: AI decision
Context: The bridge sends outbound webhooks when new messages arrive and session state changes. We can format these events either using WAHA's event payload schema (`event: "message"`, `payload: {...}`) or Telegram Bot API's `Update` schema (`update_id: 1234, message: {...}`).
Options: A. WAHA-style JSON payloads (`event: "message.created" | "session.status"`, `session: "default"`, `payload: {...}`) with consistent REST naming; B. Telegram Bot API `Update` schema (`update_id`, `message`).
AI Recommendation: A, because WAHA's convention is built specifically for multi-session REST gateways bridging messenger platforms and makes the session context explicit in every webhook payload.
Your answer:

## 2. Session storage and persistence model
Kind: AI decision
Context: Each Eitaa session requires persisting authentication state, crypto auth keys, and connection tokens across service restarts.
Options: A. Dedicated filesystem storage directory per session (`projects/001-eitaa/data/sessions/{session_id}/`), mounted to Docker volume `/data`, with session metadata in a local configuration index; B. Relational storage in PostgreSQL (`workshop-db`) storing binary session state in database rows.
AI Recommendation: A, because messenger client engines (MTProto, Playwright, or web client sessions) rely heavily on file-based socket and auth caches, making directory-isolated volume mounts robust, fast, and easy to backup or clear.
Your answer: I think maybe B is better. e.g. you can save the data on the db and just fetch the diff, etc. it will be fatser. wont it?

## 3. Scope cut for Version 0.1
Kind: AI decision
Context: To achieve a reliable, demonstrable foundation in version 0.1, we must focus strictly on the core journey (multi-session lifecycle, OTP login, chat list, message send/receive, and webhooks), banking all administrative and secondary features.
Options: A. Accept the proposed 0.1 journey: Session management, phone+OTP+2FA login, chat listing, message history, text & media sending, outbound webhooks, and live Swagger UI; B. Add channel/group management or reaction endpoints to version 0.1.
AI Recommendation: A, to ensure rapid end-to-end verification and stability before expanding to group and channel administration in 0.2.
Your answer: eitaa has not reaction yet. but it has channel/groups and I want them too in V0.1 . but you can move one time acts like editing profile and settings into roadmap.

## 4. Evaluation of candidate library in `existing/eBot`
Kind: AI decision
Context: Candidate code from sibling directory `../eBot` has been copied to `projects/001-eitaa/existing/eBot`. It contains a custom Node.js MTProto implementation for Eitaa. During `job-mechanism`, we need to inspect whether this code is reliable or if alternative approaches (e.g. reverse-engineering Eitaa web client or Playwright) should be pursued.
Options: A. Evaluate `existing/eBot` as Option A in `job-mechanism`, alongside Eitaa Web client reverse-engineering (Option B) and Playwright (Option C); B. Discard `existing/eBot` immediately without inspection and focus solely on browser automation.
AI Recommendation: A, because inspecting the candidate code may uncover functional MTProto schemas, cryptography, or endpoint details that save significant development time.
Your answer: start with eBot. if you could not use it, try playwright.

---

## Resolution

Submitted by participant in chat (`done`).

| Item | Selected Choice | Certainty | Reason & Notes |
| --- | --- | --- | --- |
| 1. Webhook payload formatting standard | Option A (WAHA-style JSON payloads) | Delegated / Provisional | Blank submission delegates recommendation; WAHA payloads supply clear multi-session context (`event`, `session`, `payload`). |
| 2. Session storage and persistence model | Option B (PostgreSQL database storage) | Confirmed | Participant selected PostgreSQL (`workshop-db`) to enable efficient state persistence, diff synchronization, and queryable metadata. |
| 3. Scope cut for Version 0.1 | Custom scope (Channels & groups included in v0.1; profile/settings editing in roadmap) | Confirmed | Participant requested channel and group messaging and listing in v0.1; reactions noted as absent on Eitaa; account profile/settings editing deferred to roadmap. |
| 4. Evaluation of candidate library in `existing/eBot` | Option A (`eBot` first, Playwright fallback) | Confirmed | Participant confirmed prioritizing `eBot` MTProto client as primary candidate, falling back to Playwright if `eBot` cannot be used. |
