# 001-eitaa: Eitaa REST/OpenAPI Gateway

Standardized multi-session REST API gateway and Swagger UI for Eitaa messenger, enabling AI agents and developers to interact with Eitaa user accounts via clean HTTP endpoints and webhooks.

## Product Summary
- Platform Target: Eitaa messenger (پیام‌رسان ایتا)
- Core Model: WAHA-inspired multi-session gateway with OpenAPI 3.0 specification and Swagger UI
- Key Operations: Session creation, phone+OTP login, chat listing, message history, text/media sending, outbound webhooks
- Primary Domain: `https://eitaa.api.kiloapp.ir`
- Deployment: Docker Compose on shared server `82.39.165.56`, routed via Traefik with automated TLS
- Access Control: Project-scoped `(session_id, api_key)` authorization managed via gitignored credentials and `kandoo/scripts/generate-session-key.sh`
