# Setup preferences / تنظیمات اولیه

Open the `docs/` folder as an Obsidian vault (or your markdown editor). Answer the questions below directly under each `Your answer:` line, save the file, then say `done` / `نوشتم` in chat. If you leave an item blank, submitting the file delegates that item to the AI recommendation provisionally.

## 1. Workspace name
Kind: open question
Context: The current workspace directory is `api`. A short name identifies this Kandoo workspace across documentation and progress.
Options: A. Keep `api`; B. Choose a custom workspace name.
AI Recommendation: A, keep `api` to match the workspace directory.
Your answer: A

## 2. Conversation language
Kind: open question
Context: The conversation language governs chat messages, status reports, progress bars, and next-action instructions.
Options: A. English; B. Persian (فارسی).
AI Recommendation: A, English (matching the invocation command; or Persian if preferred).
Your answer: A

## 3. Document language
Kind: open question
Context: The document language governs specifications, living summaries, PRDs, and dossiers written into `docs/`.
Options: A. English; B. Persian (فارسی); C. Bilingual (English technical terms, Persian prose).
AI Recommendation: A, English (or Persian if your deliverables are in Persian).
Your answer: A

## 4. AI host and invocation style
Kind: AI decision
Context: Antigravity is detected as the active AI environment, with shared skills configured in `.agents/skills/`.
Options: A. Antigravity (slash commands and skill picker); B. Claude Code; C. OpenCode; D. Codex.
AI Recommendation: A, Antigravity.
Your answer: A

## 5. Repository-local Git identity
Kind: AI decision
Context: Git global configuration currently contains `user.name = Omid Baharloo` and `user.email = baharloo.omid@gmail.com`. The Constitution requires setting repository-local identity without modifying global settings.
Options: A. Set repository-local `user.name` to "Omid Baharloo" and `user.email` to "baharloo.omid@gmail.com"; B. Provide different repository-local name and email.
AI Recommendation: A, set repository-local identity using the detected name and email.
Your answer: A

## 6. Participant-owned remote repository
Kind: AI decision
Context: The remote `origin` is configured as `git@github.com:gonbad/api.git`. Read connectivity was verified via SSH (`git ls-remote`). We need to confirm whether this is your owned repository for backup and write verification.
Options: A. Confirm `git@github.com:gonbad/api.git` as your primary backup remote; B. Provide a different remote repository URL.
AI Recommendation: A, keep `origin` pointing to `git@github.com:gonbad/api.git`.
Your answer: A

## 7. Shared server and proxy
Kind: open question
Context: A shared Linux server (VPS or dedicated) can host databases (PostgreSQL/Redis), public HTTPS reverse proxy, and authenticated HTTP forward proxy. If you do not have a server or prefer local development, answering `none` cleanly records no server without buying one or blocking work. If you have a server, initial credentials will be entered only into gitignored `docs/kandoo/secrets/credentials.md` (never in chat or question files).
Options: A. `none` (local-only, continue without a server); B. I have a Linux server ready and want to configure SSH, HTTPS, and forward proxy.
AI Recommendation: A, `none` (local development; a server can be added at any time with `/kandoo-server`).
Your answer: B


## Resolutions / تصمیمات نهایی این دور

| # | Item | Selected choice | Evidence of submission | Certainty | Reason |
|---|---|---|---|---|---|
| 1 | Workspace name | A (`api`) | Submitted `Your answer: A` in `01-questions.md` | Confirmed (`قطعی`) | Participant explicitly chose A |
| 2 | Conversation language | A (`English`) | Submitted `Your answer: A` in `01-questions.md` | Confirmed (`قطعی`) | Participant explicitly chose A |
| 3 | Document language | A (`English`) | Submitted `Your answer: A` in `01-questions.md` | Confirmed (`قطعی`) | Participant explicitly chose A |
| 4 | AI host and invocation style | A (`Antigravity`) | Submitted `Your answer: A` in `01-questions.md` | Confirmed (`قطعی`) | Participant explicitly chose A |
| 5 | Repository-local Git identity | A (`Omid Baharloo <baharloo.omid@gmail.com>`) | Submitted `Your answer: A` in `01-questions.md` | Confirmed (`قطعی`) | Participant explicitly chose A; configured locally |
| 6 | Participant-owned remote repository | A (`git@github.com:gonbad/api.git`) | Submitted `Your answer: A` in `01-questions.md` | Confirmed (`قطعی`) | Participant explicitly confirmed origin remote |
| 7 | Shared server and proxy | B (Server configuration requested) | Submitted `Your answer: B` in `01-questions.md` | Confirmed (`قطعی`) | Participant explicitly requested server onboarding |
