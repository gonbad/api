# Deployment Notes: Eitaa Bridge Gateway v0.1

- **Project**: 001-eitaa
- **Version**: 0.1
- **Release Date**: 2026-11-16
- **Deployment Status**: Live and Verified (Production)

---

## 1. Production Service Endpoints

- **Base URL**: `https://eitaa.api.kiloapp.ir`
- **Interactive Swagger UI**: [https://eitaa.api.kiloapp.ir/docs](https://eitaa.api.kiloapp.ir/docs)
- **OpenAPI 3.0.3 Specification**: [https://eitaa.api.kiloapp.ir/api/docs/json](https://eitaa.api.kiloapp.ir/api/docs/json)
- **Health Check Probe**: [https://eitaa.api.kiloapp.ir/api/health](https://eitaa.api.kiloapp.ir/api/health)

---

## 2. Infrastructure Architecture & Connectivity

| Layer | Component | Specification | Live Evidence |
| :--- | :--- | :--- | :--- |
| **Server** | Shared VPS Host | `82.39.165.56` (Ubuntu 24.04 x86_64, SSH user: `root`, port: 22) | Verified dedicated SSH key login |
| **DNS** | Subdomain A Record | `eitaa.api.kiloapp.ir` -> `82.39.165.56` | Resolved with 0ms conflict |
| **Reverse Proxy** | Traefik | Version 3.6 (`coolify-proxy`) on ports 80 / 443 | Dynamic routing in `/data/coolify/proxy/dynamic/eitaa-api.yaml` |
| **TLS / SSL** | Let's Encrypt | Automated ACME HTTP-01 certificate issuance | `CN=eitaa.api.kiloapp.ir` (Issuer: Let's Encrypt, HTTP/2 200) |
| **Application** | Docker Container | `eitaa-bridge` (Node.js 20 Alpine, port 8016) | Docker status: `Up (healthy)`, restart: `unless-stopped` |
| **Network** | Docker Bridge | `coolify` (bridge gateway: `10.0.1.1`) | Container bound to `10.0.1.1:8016` and internal DNS |
| **Datastore** | PostgreSQL 17.11 | `workshop-db:5432/eitaa_bridge` | Connected; schema migrations applied for `sessions`, `entities`, `sync_diffs` |
| **Storage Volume** | Persistent Volume | `/opt/kandoo/projects/001-eitaa/data` & `eitaa-bridge-data` | Preserved across container rebuilds |

---

## 3. Active Sessions & Account Verification

- **Active Session Name**: `default`
- **Lifecycle Status**: `WORKING` (Auto-reconnected on boot)
- **Associated Account**:
  - Name: `پشتیبانی لسان، منتورا و کنکوریا`
  - Username: `@konkooria_admin`
  - User ID: `64924090`
  - Phone: `+98938***6976`
  - Presence: `userStatusOnline`
- **Edge Datacenter Connection**: `https://kazem.eitaa.ir/eitaa/` (Sticky transport layer)

---

## 4. Live Verification Probes

### 4.1 Health Check Probe
```bash
curl -i https://eitaa.api.kiloapp.ir/api/health
```
```http
HTTP/2 200
content-type: application/json; charset=utf-8

{"status":"ok","uptimeSeconds":27,"database":"connected","version":"0.1.0"}
```

### 4.2 Interactive Swagger UI & Dialogue Listing
- Resolved root cause for `#/Chats/listChats` Swagger UI failure:
  1. Defaulted server in `openapi.json` to `"url": "/"` (current origin), preventing SSL and hostname mismatch when testing from browser.
  2. Interactive Swagger UI requires API key authorization via the green 'Authorize' button using the API key ($GLOBAL_API_KEY), perfectly matching Section 5 line 110 and the true security posture.
- Verification call:
```bash
curl -s -H "X-Api-Key: $GLOBAL_API_KEY" "https://eitaa.api.kiloapp.ir/api/default/chats?limit=3"
```
```json
{
  "total": 26,
  "chats": [
    { "id": "109899408", "type": "channel", "title": "کارگاه MVP با هوش مصنوعی", "username": "workshop_ai" },
    { "id": "89586826", "type": "channel", "title": "دیوار کنکوریا", "username": "konkooria_wall" },
    { "id": "213563", "type": "channel", "title": "خبرگزاری تسنیم", "username": "tasnimnews" }
  ]
}
```

### 4.3 Verified Live Outbound Message to `@OmidBaharloo`
```bash
curl -s -X POST -H "Content-Type: application/json" \
  -H "X-Api-Key: $GLOBAL_API_KEY" \
  -d '{"text": "پیام تستی از سرور پروداکشن HTTPS (eitaa.api.kiloapp.ir): استقرار با موفقیت انجام شد!"}' \
  "https://eitaa.api.kiloapp.ir/api/default/chats/OmidBaharloo/messages/text"
```
```json
{
  "success": true,
  "message": {
    "id": "10204",
    "chatId": "OmidBaharloo",
    "from": "64924090",
    "fromMe": true,
    "timestamp": 1794820245,
    "text": "پیام تستی از سرور پروداکشن HTTPS (eitaa.api.kiloapp.ir): استقرار با موفقیت انجام شد!",
    "mediaType": null,
    "replyToMessageId": null
  }
}
```

---

## 5. Security & Master API Key

- **Master Header**: `X-Api-Key: $GLOBAL_API_KEY`
- **Bearer Token Alternative**: `Authorization: Bearer $GLOBAL_API_KEY`
- **Query Parameter Alternative**: `?api_key=$GLOBAL_API_KEY`
- **Interactive Swagger UI**: Requires API key authorization via the green 'Authorize' button using the API key ($GLOBAL_API_KEY).
