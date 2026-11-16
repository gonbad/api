const { getPool, readFallback, writeFallback } = require('./index');

class EntityRepository {
  async saveEntity(sessionName, entity) {
    const pool = getPool();
    const id = entity.id ? String(entity.id) : null;
    if (!sessionName || !id) return;

    const accessHash = entity.access_hash ? String(entity.access_hash) : '0';
    const type = entity.type || entity._ || 'user';
    const username = entity.username ? entity.username.replace(/^@/, '').toLowerCase() : null;
    const phone = entity.phone || null;
    const title = entity.title || `${entity.first_name || ''} ${entity.last_name || ''}`.trim() || null;

    if (pool) {
      try {
        await pool.query(
          `INSERT INTO entities (session_name, entity_id, access_hash, entity_type, username, phone, title, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (session_name, entity_id) DO UPDATE SET
             access_hash = EXCLUDED.access_hash,
             entity_type = EXCLUDED.entity_type,
             username = COALESCE(EXCLUDED.username, entities.username),
             phone = COALESCE(EXCLUDED.phone, entities.phone),
             title = COALESCE(EXCLUDED.title, entities.title),
             updated_at = NOW()`,
          [sessionName, id, accessHash, type, username, phone, title]
        );
        return;
      } catch (e) {
        console.warn('DB saveEntity error, falling back:', e.message);
      }
    }

    const data = readFallback();
    if (!data.entities[sessionName]) data.entities[sessionName] = {};
    data.entities[sessionName][id] = {
      entityId: id,
      accessHash,
      type,
      username,
      phone,
      title,
      updatedAt: new Date().toISOString(),
    };
    writeFallback(data);
  }

  async getEntityById(sessionName, entityId) {
    const id = String(entityId);
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query(
          'SELECT * FROM entities WHERE session_name = $1 AND entity_id = $2',
          [sessionName, id]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            entityId: String(r.entity_id),
            accessHash: String(r.access_hash),
            type: r.entity_type,
            username: r.username,
            phone: r.phone,
            title: r.title,
          };
        }
      } catch (e) {
        console.warn('DB getEntityById error, falling back:', e.message);
      }
    }
    const data = readFallback();
    return data.entities[sessionName] ? data.entities[sessionName][id] || null : null;
  }

  async getEntityByUsername(sessionName, usernameRaw) {
    const cleanUsername = usernameRaw.replace(/^@/, '').toLowerCase();
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query(
          'SELECT * FROM entities WHERE session_name = $1 AND LOWER(username) = $2',
          [sessionName, cleanUsername]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            entityId: String(r.entity_id),
            accessHash: String(r.access_hash),
            type: r.entity_type,
            username: r.username,
            phone: r.phone,
            title: r.title,
          };
        }
      } catch (e) {
        console.warn('DB getEntityByUsername error, falling back:', e.message);
      }
    }
    const data = readFallback();
    if (!data.entities[sessionName]) return null;
    return Object.values(data.entities[sessionName]).find(e => e.username && e.username.toLowerCase() === cleanUsername) || null;
  }

  async cacheFromDialogs(sessionName, dialogsResult) {
    if (!dialogsResult) return;
    const users = dialogsResult.users || [];
    const chats = dialogsResult.chats || [];

    for (const u of users) {
      if (u.id) {
        await this.saveEntity(sessionName, {
          id: u.id,
          access_hash: u.access_hash,
          type: 'user',
          username: u.username,
          phone: u.phone,
          first_name: u.first_name,
          last_name: u.last_name,
        });
      }
    }

    for (const c of chats) {
      if (c.id) {
        const type = c._ === 'channel' ? 'channel' : 'group';
        await this.saveEntity(sessionName, {
          id: c.id,
          access_hash: c.access_hash,
          type,
          username: c.username,
          title: c.title,
        });
      }
    }
  }
}

module.exports = new EntityRepository();
