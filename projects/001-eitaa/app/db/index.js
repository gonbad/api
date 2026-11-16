const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
const fallbackDataDir = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const fallbackDbFile = path.join(fallbackDataDir, 'db_fallback.json');

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pool;
}

function ensureFallbackFile() {
  if (!fs.existsSync(fallbackDataDir)) {
    fs.mkdirSync(fallbackDataDir, { recursive: true });
  }
  if (!fs.existsSync(fallbackDbFile)) {
    fs.writeFileSync(fallbackDbFile, JSON.stringify({ sessions: {}, entities: {}, sync_diffs: [] }, null, 2));
  }
}

function readFallback() {
  ensureFallbackFile();
  try {
    return JSON.parse(fs.readFileSync(fallbackDbFile, 'utf-8'));
  } catch (e) {
    return { sessions: {}, entities: {}, sync_diffs: [] };
  }
}

function writeFallback(data) {
  ensureFallbackFile();
  fs.writeFileSync(fallbackDbFile, JSON.stringify(data, null, 2));
}

async function initDb() {
  const p = getPool();
  if (p) {
    try {
      console.log('Connecting to PostgreSQL database...');
      await p.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          name VARCHAR(128) PRIMARY KEY,
          status VARCHAR(64) NOT NULL DEFAULT 'STOPPED',
          phone VARCHAR(32),
          token TEXT,
          imei VARCHAR(64),
          server_url TEXT,
          webhook_url TEXT,
          config JSONB DEFAULT '{}'::jsonb,
          user_profile JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS entities (
          session_name VARCHAR(128) REFERENCES sessions(name) ON DELETE CASCADE,
          entity_id BIGINT NOT NULL,
          access_hash BIGINT NOT NULL,
          entity_type VARCHAR(32) NOT NULL,
          username VARCHAR(128),
          phone VARCHAR(32),
          title TEXT,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (session_name, entity_id)
        );

        CREATE INDEX IF NOT EXISTS idx_entities_username ON entities(session_name, username);

        CREATE TABLE IF NOT EXISTS sync_diffs (
          session_name VARCHAR(128) REFERENCES sessions(name) ON DELETE CASCADE,
          pts INTEGER,
          date INTEGER,
          seq INTEGER,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (session_name)
        );
      `);
      console.log('PostgreSQL schema initialized successfully.');
      return { type: 'postgres' };
    } catch (e) {
      console.warn('PostgreSQL initialization failed, using local persistent file fallback:', e.message);
      ensureFallbackFile();
      return { type: 'fallback', file: fallbackDbFile };
    }
  } else {
    console.log('DATABASE_URL not set; using local persistent file storage:', fallbackDbFile);
    ensureFallbackFile();
    return { type: 'fallback', file: fallbackDbFile };
  }
}

module.exports = {
  getPool,
  initDb,
  readFallback,
  writeFallback,
};
