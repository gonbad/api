# Questions and decisions: Version 0.1 / Round 02

## 1. Unified chat endpoint vs dedicated channel endpoints
Kind: AI decision
Context: The contract can either unify all dialogue peers (direct users, groups, channels) under `/api/{session}/chats` with a `type` discriminator, or expose separate endpoint hierarchies such as `/api/{session}/channels` and `/api/{session}/groups`.
Options: A. Unified `/api/{session}/chats` and `/api/{session}/chats/{chatId}/messages` with `type: "direct" | "group" | "channel"`; B. Dedicated `/api/{session}/channels` and `/api/{session}/groups` endpoints.
AI Recommendation: A, because unifying peers under `chatId` aligns with WAHA and Telegram Bot API conventions, reducing endpoint duplication and allowing agent code to use a single message dispatcher.
Your answer: can we have both of them? I think WAHA has both.

## 2. Webhook delivery retry policy
Kind: AI decision
Context: When an external webhook target (e.g. an agent or automation pipeline) is temporarily offline or returns HTTP 5xx during an incoming message event:
Options: A. Retry up to 3 times with exponential backoff (2s, 10s, 30s) before marking delivery failed; B. Fire-and-forget (single attempt, log warning on delivery failure).
AI Recommendation: A, because retry resilience prevents critical customer inquiries from being dropped when agent containers restart or experience temporary network hiccups.
Your answer: B. make sure that both pull and push exist

## 3. Chat identifier resolution (numeric IDs vs @usernames)
Kind: AI decision
Context: When sending messages or querying chat history, agents may know a channel or user by its public `@username` or its raw numeric peer ID.
Options: A. Accept both numeric IDs (e.g. `12345678`) and username handles (e.g. `@eitaa_channel` or `eitaa_channel`), automatically resolving usernames to peer IDs; B. Require raw numeric IDs only.
AI Recommendation: A, because resolving public handles automatically provides a superior developer experience for agent builders and low-code integrations.
Your answer: A. but you need both user id and access hash to send a message. we may need to save access hash into DB

---

## Resolution

Submitted by participant in chat (`done`).

| Item | Selected Choice | Certainty | Reason & Notes |
| --- | --- | --- | --- |
| 1. Unified chat endpoint vs dedicated channel endpoints | Support both (Unified `/chats` + dedicated `/channels` & `/groups`) | Confirmed | Participant requested supporting both unified endpoints and dedicated channel/group endpoints, matching WAHA conventions. |
| 2. Webhook delivery retry policy | Option B (Fire-and-forget push) + robust pull APIs | Confirmed | Participant selected fire-and-forget webhook push with warning logs, emphasizing that both push (webhooks) and pull (history/messages polling) must be first-class. |
| 3. Chat identifier resolution (numeric IDs vs @usernames) | Option A (Resolving @usernames + DB entity `access_hash` caching) | Confirmed | Participant confirmed accepting both IDs and @usernames, highlighting that MTProto requires caching `(id, access_hash)` in PostgreSQL for reliable message sending. |
