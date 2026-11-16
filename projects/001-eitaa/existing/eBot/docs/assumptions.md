# Ebot Assumptions & Risks

## Technical Assumptions

### 1. Eitaa Protocol Stability
**Assumption:** Eitaa's MTProto-based protocol will remain stable and backward compatible.

**Basis:**
- Current implementation uses layer 133
- Protocol structure mirrors Telegram's MTProto
- Server endpoints appear stable (named servers: hasan, hosna, etc.)

**Risk Level:** 🟡 Medium

**Mitigation:**
- Monitor for protocol changes
- Implement version detection
- Maintain fallback to older layer versions

---

### 2. Token/IMEI Authentication Model
**Assumption:** Eitaa will continue using token + IMEI for session authentication.

**Basis:**
- Current client requires both `token` and `imei`
- Token refresh mechanism exists (`eitaaRefreshToken`)
- No indication of migration to different auth model

**Risk Level:** 🟢 Low

**Mitigation:**
- Abstract auth layer for future changes
- Store all auth parameters, not just token

---

### 3. HTTP Transport Viability
**Assumption:** HTTP POST to Eitaa servers is a supported and stable transport method.

**Basis:**
- Current implementation uses HTTP successfully
- Multiple server endpoints available for load distribution
- 30-second timeout suggests expected response times

**Risk Level:** 🟢 Low

**Mitigation:**
- Implement WebSocket transport as backup
- Monitor for transport deprecation signals

---

### 4. TL Schema Compatibility
**Assumption:** Eitaa's TL schema (`api.json`, `mtproto.json`) is compatible with Telegram's schema.

**Basis:**
- Method names match Telegram (e.g., `messages.sendMessage`, `auth.signIn`)
- Constructor IDs align with expected values
- Serialization format is standard TL

**Risk Level:** 🟡 Medium

**Mitigation:**
- Maintain custom schema files
- Test against actual Eitaa responses
- Document Eitaa-specific constructors

---

### 5. Server Availability
**Assumption:** Eitaa servers are generally available and reliable.

**Basis:**
- 10+ server endpoints in production pool
- Separate download server pool
- Random server selection for load distribution

**Risk Level:** 🟡 Medium

**Mitigation:**
- Health checks for server pool
- Automatic failover on server errors
- Circuit breaker for degraded service

---

## Business Assumptions

### 1. Legal Standing
**Assumption:** Operating a Telegram Bot API-compatible gateway for Eitaa is legally permissible.

**Basis:**
- Eitaa is an Iranian messenger without official bot API
- Service provides value to Iranian developers
- No explicit prohibition found

**Risk Level:** 🔴 High

**Mitigation:**
- Consult legal counsel before public launch
- Terms of service disclaimers
- User agreement for API usage
- Avoid storing/processing sensitive user data

---

### 2. Eitaa Tolerance
**Assumption:** Eitaa will tolerate automated/bot-like access through user accounts.

**Basis:**
- No official bot API exists
- MTProto access is possible
- Similar services exist for other messengers

**Risk Level:** 🔴 High

**Mitigation:**
- Rate limiting to appear human-like
- Respect Eitaa's implicit rate limits
- Be prepared for account bans
- Multi-session architecture for resilience

---

### 3. Market Demand
**Assumption:** There is sufficient demand for Eitaa bots among Iranian developers.

**Basis:**
- Eitaa is popular in Iran
- Telegram bot ecosystem is mature
- Developers would benefit from familiar API

**Risk Level:** 🟢 Low

**Mitigation:**
- Start with free tier to validate demand
- Gather user feedback early
- Pivot if market proves insufficient

---

## Architectural Assumptions

### 1. Stateless API Servers
**Assumption:** The Core API service can be stateless, with all state in shared database/cache.

**Basis:**
- Token lookups from database
- Session state in PostgreSQL
- No in-memory state required

**Risk Level:** 🟢 Low

**Mitigation:**
- Use Redis for session caching
- Ensure database high availability
- Design for horizontal scaling

---

### 2. Access Hash Strategy
**Assumption:** Encoding access_hash in chat_id is acceptable for Telegram Bot API compatibility.

**Basis:**
- No alternative without adding new API fields
- Similar patterns used in other protocol bridges
- Users typically pass chat_id from updates back to API

**Risk Level:** 🟡 Medium

**Mitigation:**
- Clear documentation for users
- Validate chat_id format on all endpoints
- Provide helper utilities for parsing

---

### 3. Update Polling Feasibility
**Assumption:** Polling Eitaa for updates is feasible and reliable.

**Basis:**
- `messages.getDialogs` and similar methods available
- Update mechanism exists (`eitaaUpdatesExpireToken`)
- No evidence of push-only update model

**Risk Level:** 🟡 Medium

**Mitigation:**
- Implement adaptive polling intervals
- Handle duplicate updates (deduplication)
- Track update offsets per session

---

### 4. Single Datacenter
**Assumption:** Eitaa primarily uses datacenter ID 2 for all operations.

**Basis:**
- Current code hardcodes `dcId = 2`
- DC list contains only DC 2
- No evidence of multi-DC routing

**Risk Level:** 🟢 Low

**Mitigation:**
- Architecture supports multiple DCs
- Monitor for DC migration requirements

---

## Security Assumptions

### 1. Token Security
**Assumption:** Eitaa tokens are long-lived and sensitive credentials.

**Basis:**
- Token refresh mechanism exists
- Token used for all authenticated requests
- Similar to Telegram session tokens

**Risk Level:** 🔴 High

**Mitigation:**
- Encrypt tokens at rest
- Never log tokens
- Implement token rotation
- Secure token transmission (HTTPS only)

---

### 2. IMEI Uniqueness
**Assumption:** IMEI should be unique per session/device to avoid conflicts.

**Basis:**
- IMEI is required for all requests
- Likely used for device fingerprinting
- Duplicate IMEI may cause session conflicts

**Risk Level:** 🟡 Medium

**Mitigation:**
- Generate unique IMEI per session
- Store IMEI with session data
- Don't share IMEI across sessions

---

### 3. No End-to-End Encryption
**Assumption:** Messages through Ebot are not end-to-end encrypted.

**Basis:**
- Bot APIs typically don't support E2E
- Server-side processing required
- Eitaa may have E2E for secret chats only

**Risk Level:** 🟡 Medium

**Mitigation:**
- Document security limitations
- Don't claim E2E encryption
- Warn users about sensitive data

---

## Operational Assumptions

### 1. Rate Limits Exist
**Assumption:** Eitaa has undocumented rate limits that must be respected.

**Basis:**
- All messaging platforms have rate limits
- Aggressive usage may trigger bans
- No official documentation available

**Risk Level:** 🔴 High

**Mitigation:**
- Implement conservative rate limiting
- Monitor for rate limit errors
- Backoff on suspected throttling
- Per-user/per-bot quotas

---

### 2. Account Ban Risk
**Assumption:** Eitaa accounts used as bots may be banned.

**Basis:**
- ToS likely prohibits automated access
- Unusual patterns may trigger detection
- Similar to Telegram userbot bans

**Risk Level:** 🔴 High

**Mitigation:**
- Warm up new sessions gradually
- Human-like delays between actions
- Multiple backup sessions
- Clear user warnings about ban risk

---

### 3. Feature Parity Limitations
**Assumption:** Not all Telegram Bot API features can be mapped to Eitaa.

**Basis:**
- Eitaa may lack some Telegram features
- Different feature set (e.g., Eitaa-specific methods)
- Some methods may require admin privileges

**Risk Level:** 🟡 Medium

**Mitigation:**
- Document unsupported methods
- Return meaningful errors for unsupported features
- Provide Eitaa-specific alternatives where possible

---

## Risk Summary Matrix

| Risk Category | Risk | Probability | Impact | Priority |
|--------------|------|-------------|--------|----------|
| Legal | Service legality | Medium | Critical | 🔴 P1 |
| Platform | Account bans | High | High | 🔴 P1 |
| Platform | Rate limit violations | High | High | 🔴 P1 |
| Security | Token compromise | Low | Critical | 🔴 P1 |
| Technical | Protocol changes | Medium | High | 🟡 P2 |
| Technical | Schema incompatibility | Medium | Medium | 🟡 P2 |
| Operational | Server unavailability | Low | Medium | 🟢 P3 |
| Business | Low market demand | Low | Medium | 🟢 P3 |

---

## Open Questions

1. **What are Eitaa's actual rate limits?**
   - Need empirical testing
   - Monitor error responses

2. **How long do tokens remain valid?**
   - Token refresh mechanism exists
   - Need to determine expiry timing

3. **Can group/channel admin actions be performed?**
   - Requires testing with admin accounts
   - May have additional restrictions

4. **What Eitaa-specific features should be exposed?**
   - Live media (`liveGetMedia`)
   - Other Eitaa-only methods

5. **How does Eitaa handle file uploads?**
   - Separate download servers exist
   - Need to implement upload protocol

6. **Is there a way to receive push updates?**
   - Current implementation is poll-based
   - Push would reduce latency and load
