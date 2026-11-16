# 001-eitaa Roadmap

Deferred features, improvements, and secondary use cases for future versions:

- [ ] **Channel Subscriber Accumulator & Historical Roster (v0.2)**: `Ready to select`
  - **Summary**: Eitaa limits member inspection to only the last 100 joined participants via `channels.getParticipants` (`channelParticipantsRecent`). For channels where the session account has administrator privileges, periodically poll and accumulate newly joined members into a persistent PostgreSQL table (`channel_subscribers`), recording user ID, `access_hash`, name, username, and joined timestamp, exposing an endpoint (`GET /api/{session}/channels/{channelId}/subscribers`) to query the complete historical member list.
  - **Value & Differentiation**: Overcomes Eitaa's native platform limitation, enabling CRM synchronization, analytics, and marketing automations that are otherwise impossible.
  - **Dependencies**: MTProto `channels.getParticipants`, PostgreSQL persistence table, lightweight background polling worker.

- [ ] **Extended User Profile & Photos Resolution (v0.2)**: `Ready to select`
  - **Summary**: Endpoint to resolve a user ID (using cached `access_hash`) to retrieve full profile metadata (`users.getFullUser`) including current name, username, bio description, and fetch all profile avatar pictures (`photos.getUserPhotos`).
  - **Value & Differentiation**: Equips conversational AI and customer support agents with complete customer identity cards and profile photos.
  - **Dependencies**: MTProto `users.getFullUser`, `photos.getUserPhotos`, entity cache.

- [ ] **Multi-Account Proxy Routing (v0.2)**: Assign dedicated outbound HTTP/SOCKS5 proxies per session to prevent IP blocking and distribute traffic.
- [ ] **Voice & Audio Transcoding (v0.2)**: Support sending and converting voice messages with opus/ogg waveform headers.
- [ ] **Account Profile & Settings Management (v0.2)**: Endpoints to update account name, bio description, avatar profile photo, and privacy settings.
- [ ] **Rate Limiting & Queue Resilience (v0.3)**: Redis-backed outbound rate limiter and message queue to respect platform burst limits.
- [ ] **Channel & Group Administration (v0.3)**: Managing member kick/ban actions, invite link generation, and channel/group metadata edits (beyond v0.1 messaging).
- [ ] **Contact Synchronization & User Lookup (v0.4)**: Sync address book contacts and resolve phone numbers to Eitaa user profiles.
- [ ] **QR Code Login (Future)**: Support QR code session pairing if introduced by future Eitaa web client updates.
