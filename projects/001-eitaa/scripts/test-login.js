#!/usr/bin/env node
/**
 * Standalone Eitaa Authentication Test Script
 * Verifies live MTProto handshake, phone OTP dispatch, code verification, and post-login calls.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Client = require('../existing/eBot/eitaa/src/client');

const CREDENTIALS_PATH = path.resolve(__dirname, '../../../docs/projects/001-eitaa/secrets/credentials.md');
const STATE_FILE = path.resolve(__dirname, '../.auth_state.json');

const EITAA_API_ID = 1025907;
const EITAA_API_HASH = '452b0359b988148995f22ff0f4229750';

function readCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    return {};
  }
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  const getMatch = (key) => {
    const regex = new RegExp(`-\\s*${key}:\\s*([^\\r\\n]+)`, 'i');
    const m = content.match(regex);
    return m ? m[1].trim() : '';
  };

  return {
    phone: getMatch('Test phone number'),
    code: getMatch('Test OTP code'),
    password: getMatch('Test 2FA password'),
    token: getMatch('Existing session token'),
    imei: getMatch('Existing session IMEI'),
  };
}

function saveState(data) {
  const current = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) : {};
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...current, ...data }, null, 2));
}

function loadState() {
  return fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) : {};
}

function generateWebImei(phone) {
  const digits = (phone || '').replace(/\D/g, '').replace(/^00/, '');
  const hash = crypto.createHash('sha256').update(digits).digest('base64');
  const ts = Date.now().toString(36).slice(-8).padStart(8, '0');
  const prefix = hash.slice(0, 6);
  return `${prefix}${ts}1__web`;
}

async function ping() {
  console.log('Testing live MTProto connection and pong handshake...');
  const client = new Client({ imei: '123456789012345__web' });
  await client.connect();
  console.log('Client connected successfully. Connection state:', client.getConnectionState());
}

async function requestCode(phoneArg) {
  const creds = readCredentials();
  const phone = phoneArg || creds.phone;

  if (!phone) {
    console.error('Error: No phone number provided. Set it in docs/projects/001-eitaa/secrets/credentials.md or pass via CLI.');
    process.exit(1);
  }

  const imei = generateWebImei(phone);
  console.log(`Requesting OTP code for ${phone} via Eitaa MTProto API...`);
  const client = new Client({ imei });

  try {
    const res = await client.sendCode(phone, EITAA_API_ID, EITAA_API_HASH);
    console.log('Raw Eitaa Response:', JSON.stringify(res, null, 2));

    if (res._ === 'auth.sentCode') {
      const serverUrl = client.serverUrl;
      console.log('\nSUCCESS: Verification code dispatched by Eitaa!');
      console.log(`- Type: ${res.type._}`);
      console.log(`- Code length: ${res.type.length}`);
      console.log(`- Phone Code Hash: ${res.phone_code_hash}`);
      console.log(`- Sticky Server: ${serverUrl}`);
      console.log(`- Timeout: ${res.timeout}s`);

      saveState({
        phone,
        imei,
        serverUrl,
        phoneCodeHash: res.phone_code_hash,
        type: res.type._,
      });

      console.log('\nNext: Check your Eitaa app for the 5-digit code.');
      console.log(`Submit with: node test-login.js submit-code <code>`);
    } else {
      console.error('Unexpected response predicate:', res);
    }
  } catch (error) {
    console.error('Failed to request verification code:', error.message || error);
    process.exit(1);
  }
}

async function submitCode(codeArg, hashArg, phoneArg) {
  const creds = readCredentials();
  const state = loadState();

  const code = codeArg || creds.code;
  const hash = hashArg || state.phoneCodeHash;
  const phone = phoneArg || state.phone || creds.phone;
  const imei = state.imei || generateWebImei(phone);
  const serverUrl = state.serverUrl || null;

  if (!phone || !hash || !code) {
    console.error('Error: phone, code, and phone_code_hash are required.');
    console.error(`Values found -> Phone: ${phone || 'missing'}, Code: ${code || 'missing'}, Hash: ${hash || 'missing'}`);
    process.exit(1);
  }

  console.log(`Submitting OTP code ${code} for ${phone} (hash: ${hash}, server: ${serverUrl})...`);
  const client = new Client({ imei, serverUrl });

  try {
    const res = await client.signIn(phone, code, hash);
    console.log('Raw Eitaa Response:', JSON.stringify(res, null, 2));

    if (res.token) {
      console.log('\nSUCCESS: Session authenticated and logged in!');
      console.log(`- Token: ${res.token}`);
      console.log(`- User:`, res.user || res);
      saveState({ token: res.token, user: res.user, isAuthorized: true });

      // Live post-login verification: invoke getMe / getChats to prove the session actually works
      console.log('\n--- LIVE POST-LOGIN VERIFICATION ---');
      try {
        console.log('Fetching authenticated user profile (users.getFullUser)...');
        const me = await client.getMe();
        console.log('✅ User Profile verified successfully:', JSON.stringify(me, null, 2));
      } catch (meErr) {
        console.log('Profile verification result:', meErr.message || meErr);
      }

      try {
        console.log('Fetching dialogs list (messages.getDialogs)...');
        const chats = await client.getChats(5);
        console.log('✅ Dialogs fetched successfully. Count:', chats.dialogs ? chats.dialogs.length : 'ok');
      } catch (chatErr) {
        console.log('Dialogs fetch result:', chatErr.message || chatErr);
      }
      console.log('------------------------------------');
    } else if (res._ === 'error') {
      console.error(`Eitaa Error [${res.code}]: ${res.text}`);
      if (res.text === 'SESSION_PASSWORD_NEEDED') {
        console.log('Two-factor authentication (2FA) is enabled on this account.');
        saveState({ needs2FA: true });
      }
    }
  } catch (error) {
    console.error('Failed to submit code:', error.message || error);
    process.exit(1);
  }
}

async function submitPassword(passwordArg) {
  const creds = readCredentials();
  const state = loadState();
  const password = passwordArg || creds.password;
  const imei = state.imei || generateWebImei(state.phone);
  const serverUrl = state.serverUrl || null;

  if (!password) {
    console.error('Error: 2FA password is required.');
    process.exit(1);
  }

  console.log('Submitting 2FA cloud password...');
  const client = new Client({ imei, token: state.token, serverUrl });
  try {
    const res = await client.call('auth.checkPassword', { password });
    console.log('2FA Response:', res);
  } catch (e) {
    console.error('2FA error:', e.message || e);
  }
}

async function main() {
  const command = process.argv[2] || 'ping';

  switch (command) {
    case 'ping':
      await ping();
      break;
    case 'request-code':
      await requestCode(process.argv[3]);
      break;
    case 'submit-code':
      await submitCode(process.argv[3], process.argv[4], process.argv[5]);
      break;
    case 'submit-password':
      await submitPassword(process.argv[3]);
      break;
    default:
      console.log('Usage:');
      console.log('  node test-login.js ping');
      console.log('  node test-login.js request-code [phone]');
      console.log('  node test-login.js submit-code <code> [phone_code_hash] [phone]');
      console.log('  node test-login.js submit-password <password>');
  }
}

main().catch(console.error);
