# Questions and decisions: Version 0.1 / Round 04

## 1. Direct token import endpoint alongside interactive OTP login
Kind: AI decision
Context: The primary authentication flow is interactive phone OTP (`request-code` -> `submit-code` -> `submit-password`). In addition, developers may possess existing valid Eitaa session tokens and IMEIs from browser sessions or previous instances.
Options: A. Support both interactive Phone OTP login AND a direct token import endpoint (`POST /api/sessions/{session}/auth/import-token`); B. Restrict session creation strictly to interactive phone OTP.
AI Recommendation: A, because direct token import enables immediate session restore, automated testing, and headless migration without waiting for SMS/app codes.
Your answer: defer import to next versions.

## 2. Two-factor authentication (2FA) cloud password handling
Kind: AI decision
Context: Eitaa accounts with cloud two-factor passwords return `SESSION_PASSWORD_NEEDED` upon OTP submission.
Options: A. Support full 2FA password verification via `POST /api/sessions/{session}/auth/submit-password` invoking MTProto `auth.checkPassword`; B. Require test accounts to have 2FA disabled in version 0.1.
AI Recommendation: A, to ensure user accounts with active cloud passwords can onboard securely without reducing account security.
Your answer: OK. we should have a session state machine. if an accounts need 2FA, after submitting OTP, it should return the correct state so the client knows to invoke the 2FA endpoint.

## 3. End-to-end live account login verification
Kind: open question
Context: The standalone test script `projects/001-eitaa/scripts/test-login.js` successfully demonstrated live MTProto connectivity, returning a genuine `auth.sentCode` predicate from Eitaa servers with valid `phone_code_hash`. If you wish to complete an end-to-end interactive login with your own Eitaa account right now, enter your test phone number in gitignored `docs/projects/001-eitaa/secrets/credentials.md` and run `node projects/001-eitaa/scripts/test-login.js request-code`. Alternatively, we can proceed directly to gateway service implementation (`/job-build`) where the full REST endpoints will handle OTP verification interactively.
Options: A. Proceed to `/job-build` with the verified MTProto authentication layer and test end-to-end login via Swagger UI / REST API; B. Pause to run `test-login.js` with your personal phone number now.
AI Recommendation: A, because the MTProto handshake, serialization, and error evaluation are proven, and testing login via the running API in `job-test` provides a superior interactive experience with Swagger UI.
Your answer: I wrote my phone number there. I want you to orchestrate the test. whenever I should enter the OTP, say it to me in the chat and I write in the chat (it's harmless). also write it in the job (to test auth before actual build. it should return some results and do sth to make sure it actually works)

---

## Resolution

Submitted by participant in chat (`done`).

| Item | Selected Choice | Certainty | Reason & Notes |
| --- | --- | --- | --- |
| 1. Direct token import endpoint alongside interactive OTP login | Option B (Restrict v0.1 to interactive Phone OTP; defer direct token import) | Confirmed | Participant confirmed deferring direct token import to future version roadmap. |
| 2. Two-factor authentication (2FA) cloud password handling | Option A (Support 2FA with explicit state machine transition `AWAITING_PASSWORD`) | Confirmed | Participant confirmed supporting 2FA cloud password submission with clear state transition so API clients can act upon it. |
| 3. End-to-end live account login verification | Live interactive test orchestrated in chat + Job definition update | Confirmed | Participant provided phone number in `credentials.md`, requested assistant to orchestrate live OTP test and update Job specification to mandate live auth verification with concrete post-login actions before build. |
