const { getPool, readFallback, writeFallback } = require('./index');

class SessionRepository {
  async getSession(name) {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM sessions WHERE name = $1', [name]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          name: row.name,
          status: row.status,
          phone: row.phone,
          token: row.token,
          imei: row.imei,
          serverUrl: row.server_url,
          webhookUrl: row.webhook_url,
          config: row.config || {},
          user: row.user_profile,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      } catch (e) {
        console.warn('DB getSession error, falling back:', e.message);
      }
    }
    const data = readFallback();
    return data.sessions[name] || null;
  }

  async listSessions() {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM sessions ORDER BY created_at ASC');
        return res.rows.map(row => ({
          name: row.name,
          status: row.status,
          phone: row.phone,
          token: row.token,
          imei: row.imei,
          serverUrl: row.server_url,
          webhookUrl: row.webhook_url,
          config: row.config || {},
          user: row.user_profile,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      } catch (e) {
        console.warn('DB listSessions error, falling back:', e.message);
      }
    }
    const data = readFallback();
    return Object.values(data.sessions || {});
  }

  async saveSession(session) {
    const pool = getPool();
    const now = new Date().toISOString();
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO sessions (name, status, phone, token, imei, server_url, webhook_url, config, user_profile, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
           ON CONFLICT (name) DO UPDATE SET
             status = EXCLUDED.status,
             phone = COALESCE(EXCLUDED.phone, sessions.phone),
             token = COALESCE(EXCLUDED.token, sessions.token),
             imei = COALESCE(EXCLUDED.imei, sessions.imei),
             server_url = COALESCE(EXCLUDED.server_url, sessions.server_url),
             webhook_url = COALESCE(EXCLUDED.webhook_url, sessions.webhook_url),
             config = EXCLUDED.config,
             user_profile = COALESCE(EXCLUDED.user_profile, sessions.user_profile),
             updated_at = NOW()`,
          [
            session.name,
            session.status || 'STOPPED',
            session.phone || null,
            session.token || null,
            session.imei || null,
            session.serverUrl || null,
            session.webhookUrl || null,
            JSON.stringify(session.config || {}),
            session.user ? JSON.stringify(session.user) : null,
          ]
        );
        return;
      } catch (e) {
        console.warn('DB saveSession error, falling back:', e.message);
      }
    }
    const data = readFallback();
    const existing = data.sessions[session.name] || {};
    data.sessions[session.name] = {
      ...existing,
      ...session,
      updatedAt: now,
      createdAt: existing.createdAt || now,
    };
    writeFallback(data);
  }

  async deleteSession(name) {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query('DELETE FROM sessions WHERE name = $1', [name]);
        return;
      } catch (e) {
        console.warn('DB deleteSession error, falling back:', e.message);
      }
    }
    const data = readFallback();
    delete data.sessions[name];
    delete data.entities[name];
    writeFallback(data);
  }
}

module.exports = new SessionRepository();
