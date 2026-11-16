# Quality Criteria & Acceptance Standards

## Quality Standards for API Bridge Projects

1. **OpenAPI Schema Conformance**:
   - The OpenAPI 3.0 specification must be valid, well-formed, and served at `/api/docs/json`.
   - Swagger UI must be responsive and functional at `/` or `/dashboard/`.
   - Endpoint request/response models must accurately reflect runtime types.

2. **Session Resilience**:
   - Creating a session initializes clean state and transitions through defined states (`STARTING` -> `AWAITING_AUTH` -> `WORKING`).
   - Authentication errors or invalid OTP codes must return descriptive HTTP 400/401 JSON errors, without crashing the server process.
   - Sessions must persist across service restarts via volume storage.

3. **Message & Event Fidelity**:
   - Outbound messages return delivery confirmation and message identifiers.
   - Inbound webhook notifications accurately deliver sender information, chat identifiers, and timestamps.

4. **Owner Artifact Acceptance**:
   - Technical test results (curl outputs, unit test passes) alone do not constitute human acceptance.
   - At `job-test`, the owner must test the interactive Swagger UI and real message exchange, explicitly confirming artifact acceptance in Obsidian before proceeding to deployment.

5. **Security & Secrets Discipline**:
   - Credentials, session tokens, and API keys are strictly kept out of Git, logs, and public docs.
   - All private files reside under gitignored `docs/projects/ID/secrets/` or `.env` files.
