# Protocol Evaluation & Candidate Analysis

When building a bridge to a closed or unofficial platform, there is no universal mechanism. Each platform must be rigorously evaluated across three primary approaches during `job-mechanism`, followed by authentication verification during `job-auth`.

## Three Implementation Mechanisms

| Mechanism | Description | Strengths | Trade-offs & Risks |
| --- | --- | --- | --- |
| **1. Dedicated Protocol Library** (e.g. MTProto / Node / Python) | Direct binary/socket communication with platform datacenter servers using protocol schemas (TL / protobuf). | Lowest resource consumption, no browser overhead, fast execution, headless and robust. | Complex protocol specifications, risk of broken or unmaintained candidate libraries, encryption/crypto subtleties, protocol version deprecation. |
| **2. Internal Frontend API Reversing** | Inspecting and mimicking HTTP/WebSocket calls used by official web clients. | Lightweight HTTP requests, standard JSON/REST semantics, avoids full browser memory usage. | Sensitive to anti-bot headers, fingerprinting, rapid token expiration, CORS/CSRF or session cookies changes. |
| **3. Headless Browser Automation** (Playwright / Puppeteer) | Automating the official web client in headless Chromium. | Exact browser fidelity, bypasses complex protocol encryption, guaranteed feature parity with web client. | High CPU/RAM footprint per session, slower startup, DOM changes can break selectors, heavier container images. |

## Candidate Code Inspection Guidelines

When candidate or discovered code exists (such as `../eBot`):
1. **Never assume candidate code works**: Inspect the actual source files, verify dependencies, schemas, and transport methods.
2. **Protocol Verification**: Check whether the code implements true protocol packets (e.g., MTProto auth keys, TL serialization) or simply wraps web requests.
3. **Connection Testing**: Create minimal synthetic verification scripts in `projects/ID/scripts/` to test handshake, ping, or schema parsing before adopting.
4. **Independent Fallback**: Always have a clear fallback (e.g., frontend API reversing or Playwright) if candidate library proves defective or unmaintained.
