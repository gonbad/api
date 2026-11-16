---
name: job-auth
description: Research, compare, and verify platform authentication and login mechanisms (OTP vs QR vs tokens) with raw proof.
---

# /job-auth

Read `AGENTS.md`, the four `docs/constitution/` documents and `docs/kandoo/living/profile.md`, `job.md`, `server.md` and `status.md`. Resolve active Project `ID` and `VERSION` from status; all paths are workspace-root paths. Read installed references `docs/kandoo/living/references/workflow.md` and `protocol-evaluation.md`, `docs/projects/ID/living/mechanism.md`, and submitted rounds in the open version.

Analyze and verify the authentication and session creation mechanism for the platform:
1. **Login Flow Comparison**:
   - Compare available authentication mechanisms for the platform (e.g. phone number + SMS/OTP code, QR code scanning, web session cookie import, or existing auth token reuse).
   - Detail the exact state transitions: requesting code, submitting code, handling two-factor passwords (2FA), token generation, and token refresh.
   - Present options, trade-offs, and an explicit AI recommendation in `docs/projects/ID/versions/VERSION/NN-questions.md` for the participant to decide.
2. **Raw Authentication Proof**:
   - Write a standalone test script under `projects/ID/scripts/test-login.<ext>` using the chosen mechanism.
   - Instruct the participant to supply test credentials only into gitignored `docs/projects/ID/secrets/credentials.md`.
   - Execute the test script to prove raw authentication, OTP dispatch/verification, and session key acquisition against live platform servers.

Write `docs/projects/ID/living/auth.md` summarizing the verified authentication flow and session schema. Once the question round is submitted and raw login is verified, hand off directly to `/job-build`.

Apply the file-review/certainty protocol on `.md` files inside `docs/` and assess updates to the four domains. Persist changes in `docs/projects/ID/living/status.md` and mirror `docs/kandoo/living/status.md`. Finish with the full pipeline progress bar and one exact next action (`/job-build` or the pending question file).
