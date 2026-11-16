# Questions and decisions: Version 0.1 / Round 03

## 1. Primary implementation mechanism selection
Kind: AI decision
Context: We evaluated candidate code from `existing/eBot` against internal web API reverse-engineering and headless browser automation (Playwright). Live synthetic testing verified that `eBot` successfully communicated with Eitaa's live server pool (`hasan.eitaa.ir`) and deserialized a valid MTProto `mt_pong` packet. Option A requires only ~30 MB RAM per session (enabling 50+ sessions on our VPS), while Option C (Playwright) consumes 250–500 MB per session.
Options: A. Adopt Option A (Adapted Layer 133 MTProto client from `existing/eBot`), preserving Option C (Playwright) as contingency fallback; B. Discard MTProto and build exclusively on Option C (Playwright headless browser).
AI Recommendation: A, because Option A has been verified live against Eitaa production servers, offers superior latency (<150ms) and scalability, and uses 90% less system memory.
Your answer: try eBot and if failed, we fallback to playwright. 

## 2. Session IMEI identifier generation
Kind: AI decision
Context: Eitaa's custom outer envelope (`eitaaObject`) requires an IMEI device identifier along with the session token for every RPC request.
Options: A. Automatically generate a persistent 15-digit valid IMEI per session (stored in PostgreSQL `sessions` table), with optional manual override via `CreateSessionRequest`; B. Require API consumers to provide a real device IMEI manually when creating each session.
AI Recommendation: A, because automatic persistent IMEI provisioning simplifies agent workflows while maintaining device identity consistency across service restarts.
Your answer: A

## 3. Server pool failover and load balancing
Kind: AI decision
Context: Eitaa distributes MTProto-over-HTTP requests across 10 named endpoints (`hasan.eitaa.ir`, `hosna.eitaa.com`, `sajad.eitaa.ir`, etc.). Candidate code uses random selection on each request.
Options: A. Health-checked round-robin with automatic retry on alternative endpoints if an endpoint returns HTTP 5xx or times out; B. Pure random server selection without failover retries.
AI Recommendation: A, because active failover ensures high availability even if an individual Eitaa edge datacenter is under maintenance.
Your answer: I dont know. pick yourself.

---

## Resolution

Submitted by participant in chat (`done`).

| Item | Selected Choice | Certainty | Reason & Notes |
| --- | --- | --- | --- |
| 1. Primary implementation mechanism selection | Option A (`eBot` MTProto primary, Playwright fallback) | Confirmed | Participant confirmed proceeding with `eBot` MTProto client as primary, retaining Playwright as contingency fallback. |
| 2. Session IMEI identifier generation | Option A (Automatic persistent 15-digit IMEI with manual override) | Confirmed | Participant confirmed automatic persistent provisioning stored in PostgreSQL `sessions` table. |
| 3. Server pool failover and load balancing | Option A (Health-checked round-robin with automatic retry) | Delegated / Provisional | Participant explicitly delegated decision to AI recommendation ("pick yourself"); applying active retry failover to prevent downtime on edge server errors. |
