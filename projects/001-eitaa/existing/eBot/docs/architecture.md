# Ebot Architecture Document

## Overview

Ebot is a **Telegram Bot API–compatible gateway** for Eitaa messenger. It enables developers to use existing Telegram bot code with Eitaa by providing a protocol translation layer between Telegram Bot API HTTP requests and Eitaa's MTProto-based protocol.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           External Clients                               │
│                    (Telegram Bot API Compatible)                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP (Telegram Bot API Format)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CORE API SERVICE                                 │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────┐    │
│  │   Router    │──│ Protocol Layer   │──│   Response Translator   │    │
│  │ /bot<TOKEN> │  │ (TG → MTProto)   │  │   (MTProto → TG JSON)   │    │
│  └─────────────┘  └──────────────────┘  └─────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Session/Token  │    │   Eitaa Client  │    │    Webhook      │
│    Database     │    │    (MTProto)    │    │    Manager      │
└─────────────────┘    └────────┬────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EITAA SERVERS                                    │
│         (hasan.eitaa.ir, hosna.eitaa.com, sajad.eitaa.ir, ...)          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Eitaa Client (`eitaa/src/client.js`)

The main client class that manages connections to Eitaa servers.

**Responsibilities:**
- Connection lifecycle management
- Token/IMEI-based authentication
- Auto token refresh on expiration
- High-level API methods (sendMessage, getChats, etc.)
- Event emission for connection states

**Key Properties:**
- `token` - Eitaa session token
- `imei` - Device identifier (required)
- `rpcs` - Map of RPC connections per datacenter
- `isConnected` / `isAuthorized` - State flags

### 2. RPC Layer (`eitaa/src/rpc/index.js`)

Handles remote procedure calls to Eitaa servers.

**Responsibilities:**
- Method invocation via TL serialization
- Wrapping requests in `eitaaObject` format
- Response deserialization
- Message ID generation

**Request Flow:**
```
call(method, params)
    → Serialize with TL builder
    → Wrap in eitaaObject (token, imei, layer=133)
    → Send via Transport
    → Deserialize response
```

### 3. Transport Layer (`eitaa/src/transport/index.js`)

HTTP-based transport for communicating with Eitaa servers.

**Features:**
- Load balancing across multiple Eitaa servers
- 30-second request timeout
- Debug mode with separate server endpoints
- Binary data transmission (application/octet-stream)

**Server Pools:**
- **Production:** 10 servers (hasan, hosna, armita, majid, alireza, mostafa, sajad, bagher, sadegh, kazem)
- **Download:** 5 dedicated servers (mohsen, ghasem, hadi, hossein, vahid)

### 4. TL (Type Language) System

#### Serializer (`eitaa/src/tl/serializer/`)
- Converts JavaScript objects to binary TL format
- Supports primitives: int32, uint32, long, int128, int256, double
- Handles strings, bytes, vectors, and predicates
- Automatic padding to 4-byte alignment

#### Deserializer (`eitaa/src/tl/deserializer/`)
- Parses binary TL responses to JavaScript objects
- Supports gzip decompression
- Predicate lookup by constructor ID

#### Builder & Parser
- **Builder:** Maps method names to serialization functions
- **Parser:** Maps constructor IDs to deserialization functions
- Generated from `scheme/api.json` and `scheme/mtproto.json`

### 5. Crypto Module (`eitaa/src/crypto/`)

**Components:**
- **AES:** Encryption/decryption
- **PQ:** Prime factorization for key exchange
- **RSA:** Asymmetric encryption utilities
- **SRP:** Secure Remote Password protocol for authentication

---

## Data Flow

### Outgoing Request (Client → Eitaa)

```
1. Client.call(method, params)
   │
2. RPC.sendPlainMessage()
   │  └─ Serialize params with TL Builder
   │  └─ Wrap in eitaaObject {token, imei, packed_data, layer}
   │
3. Transport.send(bytes)
   │  └─ Select random server from pool
   │  └─ HTTP POST with binary body
   │
4. Eitaa Server Response
   │
5. RPC.handleEitaaResponse()
   │  └─ Deserialize binary to JS object
   │
6. Return to Client
```

### Token Refresh Flow

```
1. Response contains 'mt_eitaa_token_updating' or 'mt_eitaa_updates_expire_token'
   │
2. Client.refreshToken()
   │  └─ Call eitaaRefreshToken with app_info
   │
3. Update token in:
   │  ├─ Client instance
   │  ├─ All RPC instances
   │  └─ Database (via callback)
   │
4. Retry original request with new token
```

---

## Database Schema (Planned)

### Sessions Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| eitaa_token | TEXT | Eitaa session token |
| imei | TEXT | Device identifier |
| phone_number | TEXT | Associated phone |
| status | ENUM | active/expired/revoked |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

### Bots Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| api_token | TEXT | Telegram-style bot token |
| session_id | UUID | FK to sessions |
| webhook_url | TEXT | Webhook endpoint |
| webhook_secret | TEXT | Webhook validation |
| update_offset | BIGINT | Last processed update |
| created_at | TIMESTAMP | Creation time |

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User email |
| password_hash | TEXT | Hashed password |
| created_at | TIMESTAMP | Creation time |

---

## API Compatibility Layer (To Be Implemented)

### Endpoint Format
```
POST /bot<TOKEN>/<METHOD>
```

### Request Translation
```javascript
// Telegram Bot API Request
POST /bot123456:ABC-DEF/sendMessage
{
  "chat_id": "12345-67890",  // Encoded: actual_id-access_hash
  "text": "Hello World"
}

// Translated to Eitaa MTProto
client.call('messages.sendMessage', {
  peer: {
    _: 'inputPeerUser',
    user_id: 12345,
    access_hash: 67890
  },
  message: "Hello World",
  random_id: <generated>
})
```

---

## Update Delivery System (To Be Implemented)

### Long Polling (getUpdates)
```
Client ──► Core API ──► Internal Update Queue ──► Response
              │
              └─► Poll Eitaa (background)
```

### Webhook
```
Eitaa Update ──► Core API ──► Webhook URL
                    │
                    └─► Retry Queue (on failure)
```

---

## Security Considerations

1. **Token Storage:** Encrypted at rest, never logged
2. **IMEI Management:** Unique per session, not shared
3. **Rate Limiting:** Per-token and per-IP limits
4. **Input Validation:** Sanitize all Telegram API inputs
5. **Access Hash Encoding:** Embedded in chat_id to prevent leakage

---

## Scalability Strategy

1. **Horizontal Scaling:** Stateless API servers behind load balancer
2. **Connection Pooling:** Reuse Eitaa connections per session
3. **Caching:** Redis for session lookups and rate limiting
4. **Queue System:** Background workers for webhooks and updates
5. **Database:** PostgreSQL with read replicas

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js ≥18 |
| HTTP Framework | Express.js |
| Database | PostgreSQL |
| Documentation | Swagger/OpenAPI |
| Logging | Winston |
| Crypto | aes-js, big-integer |
| Compression | pako (gzip) |
