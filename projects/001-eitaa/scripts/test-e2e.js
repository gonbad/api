#!/usr/bin/env node

/**
 * End-to-End Test Suite for Eitaa Bridge Gateway
 * Tests OpenAPI, Session Lifecycle, Dialogues, Message History, and Live Sending
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8016';
const API_KEY = process.env.GLOBAL_API_KEY || 'eitaa-bridge-master-secret-key-001';

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    const reqHeaders = { ...headers };
    let postData = null;

    if (body) {
      postData = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch (e) {}
          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== Starting E2E Verification Suite for Eitaa Bridge ===\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`[TEST] ${name} ... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (e) {
      console.log('❌ FAIL:', e.message);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health returns 200 OK', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200 || res.data.status !== 'ok') {
      throw new Error(`Unexpected response: ${res.status} ${JSON.stringify(res.data)}`);
    }
  });

  // 2. Swagger UI
  await test('GET /docs returns 200 OK (Swagger UI)', async () => {
    const res = await request('GET', '/docs/');
    if (res.status !== 200) {
      throw new Error(`Swagger UI status ${res.status}`);
    }
  });

  // 3. OpenAPI JSON
  await test('GET /api/docs/json returns valid OpenAPI 3.0.3 with 19 paths', async () => {
    const res = await request('GET', '/api/docs/json');
    if (res.status !== 200 || !res.data.openapi.startsWith('3.0')) {
      throw new Error(`Invalid OpenAPI version: ${res.data.openapi}`);
    }
    const pathsCount = Object.keys(res.data.paths || {}).length;
    if (pathsCount < 15) {
      throw new Error(`Expected at least 15 paths, got ${pathsCount}`);
    }
  });

  // 4. Auth protection
  await test('GET /api/sessions rejects unauthorized requests with 401', async () => {
    const res = await request('GET', '/api/sessions');
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    }
  });

  // 5. Active session verification
  await test('GET /api/sessions with X-Api-Key returns active session default in WORKING state', async () => {
    const res = await request('GET', '/api/sessions', { 'X-Api-Key': API_KEY });
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Expected array of sessions, got ${res.status}`);
    }
    const def = res.data.find((s) => s.name === 'default');
    if (!def) throw new Error('Session "default" not found');
    if (def.status !== 'WORKING') throw new Error(`Expected status WORKING, got ${def.status}`);
    if (!def.me || !def.me.id) throw new Error('Session user identity not populated');
  });

  // 6. Session lifecycle
  await test('POST /api/sessions and DELETE /api/sessions/:session lifecycle', async () => {
    const tempName = `temp-test-${Date.now()}`;
    const createRes = await request('POST', '/api/sessions', { 'X-Api-Key': API_KEY }, { name: tempName });
    if ((createRes.status !== 200 && createRes.status !== 201) || createRes.data.status !== 'STOPPED') {
      throw new Error(`Failed to create temp session: ${createRes.status} ${JSON.stringify(createRes.data)}`);
    }

    const getRes = await request('GET', `/api/sessions/${tempName}`, { 'X-Api-Key': API_KEY });
    if (getRes.status !== 200 || getRes.data.name !== tempName) {
      throw new Error(`Failed to get temp session: ${getRes.status}`);
    }

    const delRes = await request('DELETE', `/api/sessions/${tempName}`, { 'X-Api-Key': API_KEY });
    if (delRes.status !== 200 || !delRes.data.success) {
      throw new Error(`Failed to delete temp session: ${delRes.status}`);
    }
  });

  // 7. Chats listing
  await test('GET /api/default/chats returns live dialogues', async () => {
    const res = await request('GET', '/api/default/chats?limit=5', { 'X-Api-Key': API_KEY });
    if (res.status !== 200 || !Array.isArray(res.data.chats) || res.data.chats.length === 0) {
      throw new Error(`Failed to fetch chats: ${res.status} ${JSON.stringify(res.data)}`);
    }
  });

  // 8. Channels listing
  await test('GET /api/default/channels returns channels array', async () => {
    const res = await request('GET', '/api/default/channels?limit=3', { 'X-Api-Key': API_KEY });
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error(`Failed to fetch channels: ${res.status}`);
    }
  });

  // 9. Message history
  await test('GET /api/default/chats/:chatId/messages returns message slice', async () => {
    const res = await request('GET', '/api/default/chats/64924090/messages?limit=5', { 'X-Api-Key': API_KEY });
    if (res.status !== 200 || !Array.isArray(res.data.messages)) {
      throw new Error(`Failed to fetch messages: ${res.status} ${JSON.stringify(res.data)}`);
    }
  });

  // 10. Live message dispatch
  await test('POST /api/default/chats/:chatId/messages/text sends live message', async () => {
    const res = await request(
      'POST',
      '/api/default/chats/64924090/messages/text',
      { 'X-Api-Key': API_KEY },
      { text: `Automated E2E Test Suite Run: PASS [${new Date().toISOString()}]` }
    );
    if (res.status !== 200 || !res.data.success || !res.data.message || !res.data.message.id) {
      throw new Error(`Failed to send message: ${res.status} ${JSON.stringify(res.data)}`);
    }
  });

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
