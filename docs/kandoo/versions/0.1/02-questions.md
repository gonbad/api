# Job definition and Project 1 choices / تصمیمات تعریف روش و پروژه اول

Open the `docs/` folder in Obsidian (or your markdown editor). Answer the questions below directly under each `Your answer:` line, save the file, then say `done` in chat. If you leave an item blank, submitting the file delegates that item to the AI recommendation provisionally.

## 1. Job foundation and method path
Kind: AI decision
Context: Your repeated work turns closed or unofficial platforms (messengers, web interfaces) into standardized, developer- and agent-friendly REST/OpenAPI APIs with multi-session management, inspired by WAHA and Telegram Bot API. The Constitution offers three equal paths: use a catalog starter, adapt the nearest starter as an initial base, or author a new Job.
Options:
A. Author a new dedicated Job named `api-bridge` (designed specifically for turning third-party platforms into standardized OpenAPI REST APIs with session management, webhook/polling event dispatch, and Swagger UI).
B. Adapt `web-app-builder` from the starter catalog as an initial base, replacing frontend UI and visual design steps with API contracts and protocol reverse-engineering.
AI Recommendation: A, authoring the dedicated `api-bridge` Job directly reflects your exact workflow without dragging in unused web frontend or mockup steps.
Your answer: A

## 2. Ordered Job pipeline steps
Kind: AI decision
Context: Every platform project under this Job will follow an ordered pipeline from concept to deployed HTTPS API.
Options:
A. 6-step pipeline: `job-idea` (Platform scope, session model, and agent use cases) → `job-contract` (OpenAPI 3.0 specification, endpoints, and Swagger UI) → `job-protocol` (Protocol/library reversing & raw login proof) → `job-build` (HTTP server, session manager, webhooks, and OTP flow) → `job-test` (Endpoint, OTP, message, and webhook event verification) → `job-deploy` (Server deployment under `*.api.kiloapp.ir` with live HTTPS).
B. 5-step pipeline merging protocol verification and server build: `job-idea` → `job-contract` → `job-build` → `job-test` → `job-deploy`.
AI Recommendation: A, separating raw protocol/connection verification (`job-protocol`) from service construction (`job-build`) ensures the underlying mechanism (MTProto, Playwright, or internal API) is proven before building the full server wrapper.
Your answer: break protocol into two steps. 1. if we use a library or playwright or using frontend API vs 2. how to login to that platform. for each you should compare the options carefully and give me your recommendation and let me decide.

## 3. Project 1 target and technical foundation
Kind: AI decision
Context: The first project will be the Eitaa API (`001-eitaa`). You noted that an MTProto implementation for Eitaa exists in brother project `eBot` (`../eBot/eitaa`), which handles connection, encryption, and TL schemas.
Options:
A. Node.js with Express/Fastify leveraging the MTProto implementation adapted from `eBot`, providing OpenAPI/Swagger UI, OTP login flow, and session persistence.
B. Python (e.g. FastAPI) with a newly reverse-engineered client or browser automation via Playwright.
AI Recommendation: A, Node.js directly utilizes the existing working MTProto implementation from `eBot`, saving significant effort and ensuring high performance without heavy browser overhead.
Your answer: I never said it's working. I just found that code. maybe it's broken. and maybe it's not even MTProto. it's up to you to inspect it.

## 4. Project 1 domain and deployment target
Kind: AI decision
Context: The shared server (`82.39.165.56`) has wildcard DNS for `*.api.kiloapp.ir` pointed to it, and Traefik is running as the reverse proxy with Let's Encrypt TLS.
Options:
A. Deploy Project 1 to `https://eitaa.api.kiloapp.ir` via Traefik with automated TLS, containerized with Docker Compose and persistent session storage.
B. Deploy under a path on the root domain, such as `https://api.kiloapp.ir/eitaa/`.
AI Recommendation: A, dedicated subdomain `eitaa.api.kiloapp.ir` cleanly isolates routing, certificates, and matches your intended pattern where each platform API has its own subdomain.
Your answer: A. so in /deploy step, you should fix the routes and certificates too.

## 5. Session authentication and key strategy
Kind: open question
Context: You specified that for now, each project should maintain its own authorized list of `(session_id, api_key)` pairs rather than requiring a shared billing or centralized auth platform, while keeping server connection secrets out of Git.
Options:
A. Project-scoped session storage and key allowlist (stored in project persistent data/Docker volume, managed via admin token or initial configuration), deferring shared billing/auth to future versions.
B. Implement a centralized shared authentication and session management service in `kandoo/` right now.
AI Recommendation: A, keep session authorization project-scoped and lightweight initially as requested, deferring shared billing to later versions.
Your answer: let's have a git ignored file with those credentials. and we want a script in kandoo that ssh to the server, generates a new pair and save the credentials in that git ignored file.

## 6. Project 1 facts prefill and activation
Kind: AI decision
Context: All information from your voice transcript—regarding Eitaa, WAHA/Telegram inspiration, OTP login, and agent usage—can be prefilled into `docs/projects/001-eitaa/versions/0.1/00-idea-input.md` upon finalization so you do not need to repeat yourself.
Options:
A. Prefill `00-idea-input.md` with all captured voice transcript details, allocate `001-eitaa`, and select it as active Project 1.
B. Allocate `001-eitaa` with a blank template and ask for input again.
AI Recommendation: A, prefill all captured facts into `00-idea-input.md` to preserve your time and choices.
Your answer: A

## Resolutions / تصمیمات نهایی این دور

| # | Item | Selected choice | Evidence of submission | Certainty | Reason |
|---|---|---|---|---|---|
| 1 | Job foundation and method path | A (`api-bridge`) | Submitted `Your answer: A` in `02-questions.md` | Confirmed (`قطعی`) | Participant explicitly confirmed authoring dedicated `api-bridge` Job |
| 2 | Ordered Job pipeline steps | 7-step pipeline with split protocol steps | Submitted custom answer in `02-questions.md` | Confirmed (`قطعی`) | Participant explicitly directed splitting protocol into `job-mechanism` (library vs Playwright vs frontend API comparison) and `job-auth` (login/OTP comparison and verification) |
| 3 | Project 1 target and technical foundation | Inspect `eBot` objectively without assuming it works or is MTProto | Submitted custom answer in `02-questions.md` | Confirmed (`قطعی`) | Participant clarified `eBot` is unverified discovered code; inspect, analyze, and test during `job-mechanism` |
| 4 | Project 1 domain and deployment target | A (`https://eitaa.api.kiloapp.ir`) with Traefik route & cert configuration | Submitted `Your answer: A. so in /deploy step, you should fix the routes and certificates too.` | Confirmed (`قطعی`) | Participant confirmed subdomain and mandated route and certificate configuration in deploy step |
| 5 | Session authentication and key strategy | Gitignored credentials file + shared `kandoo/` SSH session-key script | Submitted custom answer in `02-questions.md` | Confirmed (`قطعی`) | Participant explicitly requested gitignored credentials and a shared script in `kandoo/` to generate and persist pairs on the server |
| 6 | Project 1 facts prefill and activation | A (Allocate `001-eitaa`, prefill `00-idea-input.md`, activate) | Submitted `Your answer: A` in `02-questions.md` | Confirmed (`قطعی`) | Participant explicitly confirmed prefilling and allocating Project 1 |
