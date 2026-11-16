# api-bridge

Build standardized, multi-session REST/OpenAPI APIs and gateways for closed or unofficial messaging/web platforms, inspired by WAHA and Telegram Bot API, with automated TLS and live Swagger documentation.

Job revision: 0.1

This is an adaptable initial base. Change any step, format or style to fit the participant's exact work, including while doing a real Project. No fixed schema, orientation, toolkit or bundled runtime limits the result. Start with the real idea.

## Ordered full pipeline

| Step | Persian label | Command | Condition |
| --- | --- | --- | --- |
| Idea and platform scope | هسته ایده و پلتفرم | [job-idea](commands/job-idea.md) | Adapt to actual needs |
| OpenAPI contract and Swagger | قرارداد OpenAPI و مستندات | [job-contract](commands/job-contract.md) | Adapt to actual needs |
| Mechanism evaluation | ارزیابی روش دسترسی | [job-mechanism](commands/job-mechanism.md) | Compare library vs Playwright vs frontend API |
| Authentication and login | احراز هویت و ورود | [job-auth](commands/job-auth.md) | Compare and verify login/OTP mechanism |
| Gateway implementation | پیاده‌سازی سرویس و نشست‌ها | [job-build](commands/job-build.md) | Build server, sessions and webhooks |
| API and session verification | آزمون و بازبینی عملکرد | [job-test](commands/job-test.md) | End-to-end API tests and owner acceptance |
| Server deployment and HTTPS | استقرار سرور و گواهی TLS | [job-deploy](commands/job-deploy.md) | Traefik routing, TLS cert and live verification |

For version 0.1 follow the chosen full pipeline. Later versions use only affected steps and prerequisites, recording skipped steps and reasons. Every command resolves workspace-root paths, applies file review/certainty, checks the four mutable domains and ends with dynamic localized progress plus one exact next action.

## Installed references

- [workflow](references/workflow.md): Authoritative seven-stage handoff table, stage descriptions and living documents.
- [waha-architecture](references/waha-architecture.md): Reference multi-session REST architecture, session lifecycles, Swagger UI and webhooks.
- [protocol-evaluation](references/protocol-evaluation.md): Guidelines for evaluating libraries, Playwright, frontend reverse-engineering and candidate code.
- [infrastructure](references/infrastructure.md): Server deployment, Traefik routing, automated TLS certificates, and session storage.
- [quality](references/quality.md): OpenAPI conformance, session resilience, testing standards, and human artifact acceptance.

## Retained architecture

The pipeline preserves the architecture of standardized platform API bridges:
1. Scope platform target, session requirements, and agent use cases in `job-idea`.
2. Formalize the OpenAPI 3.0 specification, endpoint schema, error models, and Swagger UI in `job-contract`.
3. Objectively inspect and compare implementation mechanisms (candidate libraries, Playwright browser automation, or internal frontend API reversing) with recommendations submitted for confirmation in `job-mechanism`.
4. Analyze and prove raw login authentication flows (OTP, QR code, or session tokens) with synthetic verification scripts in `job-auth`.
5. Implement the unified HTTP service, multi-session manager, endpoint routers, and webhook dispatcher in `job-build`.
6. Conduct interactive testing against running endpoints, verify message sending/receiving, and secure owner acceptance in `job-test`.
7. Deploy to the shared VPS with Traefik routing and Let's Encrypt TLS under `*.api.kiloapp.ir` in `job-deploy`.
