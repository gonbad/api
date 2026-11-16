const crypto = require('crypto');
const Client = require('../engine/src/client');
const sessionRepo = require('../db/sessionRepository');
const entityRepo = require('../db/entityRepository');
const webhookDispatcher = require('./webhookDispatcher');

const EITAA_API_ID = 1025907;
const EITAA_API_HASH = '452b0359b988148995f22ff0f4229750';

function generateWebImei(phone) {
  const digits = (phone || '').replace(/\D/g, '').replace(/^00/, '');
  const hash = crypto.createHash('sha256').update(digits || 'default').digest('base64');
  const ts = Date.now().toString(36).slice(-8).padStart(8, '0');
  const prefix = hash.slice(0, 6);
  return `${prefix}${ts}1__web`;
}

class SessionManager {
  constructor() {
    this.activeSessions = new Map(); // name -> { client, data }
    this.pendingAuth = new Map();   // name -> { phone, phoneCodeHash, serverUrl, imei }
  }

  async init() {
    const list = await sessionRepo.listSessions();
    console.log(`Loaded ${list.length} persisted sessions from repository.`);
    for (const s of list) {
      if (s.token) {
        try {
          console.log(`Auto-starting session: ${s.name}`);
          await this.startSession(s.name, s);
        } catch (e) {
          console.warn(`Failed to auto-start session ${s.name}:`, e.message);
        }
      }
    }
  }

  async createSession(name, options = {}) {
    if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error('Invalid session name. Must be alphanumeric with hyphens or underscores.');
    }
    const existing = await sessionRepo.getSession(name);
    if (existing) {
      throw new Error(`Session with name '${name}' already exists.`);
    }

    const sessionData = {
      name,
      status: 'STOPPED',
      phone: options.phone || null,
      token: options.token || null,
      imei: options.imei || generateWebImei(options.phone || name),
      serverUrl: options.serverUrl || null,
      webhookUrl: options.webhookUrl || process.env.WEBHOOK_URL || null,
      config: options.config || {},
      user: null,
    };

    await sessionRepo.saveSession(sessionData);

    if (options.start !== false && sessionData.token) {
      await this.startSession(name, sessionData);
    }

    return this.getSessionInfo(name);
  }

  async getSessionInfo(name) {
    const persisted = await sessionRepo.getSession(name);
    if (!persisted) return null;

    const live = this.activeSessions.get(name);
    return {
      name: persisted.name,
      status: live ? live.status : persisted.status,
      phone: persisted.phone,
      me: live && live.user ? live.user : persisted.user,
      engine: 'ebot-mtproto',
      webhookUrl: persisted.webhookUrl,
      createdAt: persisted.createdAt,
      updatedAt: persisted.updatedAt,
    };
  }

  async listSessions() {
    const list = await sessionRepo.listSessions();
    return list.map(s => {
      const live = this.activeSessions.get(s.name);
      return {
        name: s.name,
        status: live ? live.status : s.status,
        phone: s.phone,
        me: live && live.user ? live.user : s.user,
        engine: 'ebot-mtproto',
        webhookUrl: s.webhookUrl,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });
  }

  async startSession(name, existingData = null) {
    const s = existingData || await sessionRepo.getSession(name);
    if (!s) throw new Error(`Session '${name}' not found.`);

    if (this.activeSessions.has(name)) {
      const current = this.activeSessions.get(name);
      if (current.client.isReady()) {
        return this.getSessionInfo(name);
      }
    }

    const imei = s.imei || generateWebImei(s.phone || name);
    const client = new Client({
      token: s.token || null,
      imei,
      serverUrl: s.serverUrl || null,
      sessionId: name,
      onTokenRefresh: async (sid, newToken) => {
        console.log(`[SessionManager] Token refreshed for session ${sid}`);
        await sessionRepo.saveSession({ name: sid, token: newToken });
      },
    });

    const sessionObj = {
      client,
      status: s.token ? 'STARTING' : 'STOPPED',
      user: s.user || null,
      webhookUrl: s.webhookUrl,
      name,
    };

    this.activeSessions.set(name, sessionObj);

    if (s.token) {
      try {
        await client.connect();
        sessionObj.status = 'WORKING';
        s.status = 'WORKING';
        s.serverUrl = client.serverUrl;
        await sessionRepo.saveSession(s);

        // Fetch fresh profile & populate entity cache
        client.getMe().then(async me => {
          if (me && me.user) {
            sessionObj.user = me.user;
            await sessionRepo.saveSession({ name, user: me.user });
          }
        }).catch(err => console.warn(`Failed initial getMe for ${name}:`, err.message));

        client.getChats(30).then(async dialogs => {
          await entityRepo.cacheFromDialogs(name, dialogs);
        }).catch(err => console.warn(`Failed initial dialog cache for ${name}:`, err.message));

        await webhookDispatcher.emitSessionStatus(name, s.webhookUrl, 'WORKING', sessionObj.user);
      } catch (err) {
        console.error(`Failed to connect session ${name}:`, err.message);
        sessionObj.status = 'FAILED';
        await sessionRepo.saveSession({ name, status: 'FAILED' });
        await webhookDispatcher.emitSessionStatus(name, s.webhookUrl, 'FAILED');
      }
    }

    return this.getSessionInfo(name);
  }

  async stopSession(name) {
    const live = this.activeSessions.get(name);
    if (live && live.client) {
      await live.client.disconnect();
    }
    this.activeSessions.delete(name);
    await sessionRepo.saveSession({ name, status: 'STOPPED' });
    const s = await sessionRepo.getSession(name);
    await webhookDispatcher.emitSessionStatus(name, s ? s.webhookUrl : null, 'STOPPED');
    return this.getSessionInfo(name);
  }

  async logoutSession(name) {
    const live = this.activeSessions.get(name);
    if (live && live.client && live.client.isAuthorized) {
      try {
        await live.client.logout();
      } catch (e) {
        console.warn(`Logout RPC error for ${name}:`, e.message);
      }
      await live.client.disconnect();
    }
    this.activeSessions.delete(name);
    await sessionRepo.saveSession({ name, status: 'STOPPED', token: null, user: null });
    const s = await sessionRepo.getSession(name);
    await webhookDispatcher.emitSessionStatus(name, s ? s.webhookUrl : null, 'STOPPED');
    return { success: true, message: `Session '${name}' logged out successfully.` };
  }

  async deleteSession(name) {
    await this.stopSession(name);
    await sessionRepo.deleteSession(name);
    return { success: true, message: `Session '${name}' removed.` };
  }

  // --- AUTHENTICATION FLOW ---

  async requestCode(name, phone) {
    let s = await sessionRepo.getSession(name);
    if (!s) {
      s = await this.createSession(name, { phone, start: false });
    }

    const imei = s.imei || generateWebImei(phone);
    const client = new Client({ imei, serverUrl: s.serverUrl || null });

    const res = await client.sendCode(phone, EITAA_API_ID, EITAA_API_HASH);
    if (res._ === 'auth.sentCode') {
      const serverUrl = client.serverUrl;
      this.pendingAuth.set(name, {
        phone,
        phoneCodeHash: res.phone_code_hash,
        serverUrl,
        imei,
      });

      await sessionRepo.saveSession({
        name,
        phone,
        status: 'AWAITING_OTP',
        serverUrl,
        imei,
      });

      await webhookDispatcher.emitSessionStatus(name, s.webhookUrl, 'AWAITING_OTP');

      return {
        status: 'AWAITING_OTP',
        phoneCodeHash: res.phone_code_hash,
        isCodeSent: true,
        timeout: res.timeout || 60,
      };
    } else {
      throw new Error(`Unexpected Eitaa response: ${res._ || JSON.stringify(res)}`);
    }
  }

  async submitCode(name, code, phoneCodeHash) {
    const pending = this.pendingAuth.get(name) || {};
    const s = await sessionRepo.getSession(name);
    if (!s) throw new Error(`Session '${name}' not found.`);

    const phone = pending.phone || s.phone;
    const hash = phoneCodeHash || pending.phoneCodeHash;
    const serverUrl = pending.serverUrl || s.serverUrl;
    const imei = pending.imei || s.imei || generateWebImei(phone);

    if (!phone || !hash || !code) {
      throw new Error('Missing phone, phoneCodeHash, or OTP code.');
    }

    const client = new Client({ imei, serverUrl });
    const res = await client.signIn(phone, code, hash);

    if (res.token) {
      const user = res.user || null;
      await sessionRepo.saveSession({
        name,
        phone,
        token: res.token,
        status: 'WORKING',
        user,
        serverUrl: client.serverUrl,
        imei,
      });

      const sessionObj = {
        client,
        status: 'WORKING',
        user,
        webhookUrl: s.webhookUrl,
        name,
      };
      this.activeSessions.set(name, sessionObj);
      this.pendingAuth.delete(name);

      await webhookDispatcher.emitSessionStatus(name, s.webhookUrl, 'WORKING', user);

      // Pre-warm entity cache
      client.getChats(30).then(dialogs => {
        entityRepo.cacheFromDialogs(name, dialogs);
      }).catch(e => console.warn('Dialogs cache error:', e.message));

      return {
        status: 'WORKING',
        user,
        message: 'Session authenticated successfully',
      };
    } else if (res._ === 'error') {
      if (res.text === 'SESSION_PASSWORD_NEEDED') {
        await sessionRepo.saveSession({ name, status: 'AWAITING_PASSWORD' });
        await webhookDispatcher.emitSessionStatus(name, s.webhookUrl, 'AWAITING_PASSWORD');
        return {
          status: 'AWAITING_PASSWORD',
          message: 'Two-factor cloud password required.',
        };
      }
      throw new Error(`Eitaa Auth Error [${res.code}]: ${res.text}`);
    } else {
      throw new Error(`Unexpected sign-in response: ${JSON.stringify(res)}`);
    }
  }

  async submitPassword(name, password) {
    const s = await sessionRepo.getSession(name);
    if (!s) throw new Error(`Session '${name}' not found.`);

    const client = new Client({ imei: s.imei, serverUrl: s.serverUrl });
    const res = await client.call('auth.checkPassword', { password });

    if (res.token) {
      const user = res.user || null;
      await sessionRepo.saveSession({
        name,
        token: res.token,
        status: 'WORKING',
        user,
      });

      const sessionObj = {
        client,
        status: 'WORKING',
        user,
        webhookUrl: s.webhookUrl,
        name,
      };
      this.activeSessions.set(name, sessionObj);
      await webhookDispatcher.emitSessionStatus(name, s.webhookUrl, 'WORKING', user);

      return {
        status: 'WORKING',
        user,
        message: '2FA authentication completed successfully',
      };
    } else {
      throw new Error(`2FA error: ${JSON.stringify(res)}`);
    }
  }

  // --- MESSAGING & CHATS ---

  getClient(name) {
    const live = this.activeSessions.get(name);
    if (!live || !live.client || !live.client.token) {
      throw new Error(`Session '${name}' is not currently active or authorized.`);
    }
    return live.client;
  }

  async getChats(name, type = 'all', limit = 30, offset = 0) {
    const client = this.getClient(name);
    const dialogs = await client.getChats(limit + offset);
    await entityRepo.cacheFromDialogs(name, dialogs);

    const chatsList = (dialogs.chats || []).concat(dialogs.users || []).map(item => {
      const isChannel = item._ === 'channel';
      const isUser = item._ === 'user';
      const dialogueType = isChannel ? 'channel' : isUser ? 'direct' : 'group';
      const title = item.title || `${item.first_name || ''} ${item.last_name || ''}`.trim();

      return {
        id: String(item.id),
        type: dialogueType,
        title,
        username: item.username || null,
        unreadCount: 0,
        lastMessage: null,
      };
    });

    const filtered = type === 'all' ? chatsList : chatsList.filter(c => c.type === type);
    const paged = filtered.slice(offset, offset + limit);

    return {
      total: filtered.length,
      chats: paged,
    };
  }

  async getChat(name, chatId) {
    const client = this.getClient(name);
    // Try entity resolution first
    const isUsername = typeof chatId === 'string' && (chatId.startsWith('@') || isNaN(Number(chatId)));
    let entity = isUsername
      ? await entityRepo.getEntityByUsername(name, chatId)
      : await entityRepo.getEntityById(name, chatId);

    if (!entity && isUsername) {
      // Resolve username via MTProto
      try {
        const resolved = await client.resolveUsername(chatId.replace(/^@/, ''));
        if (resolved && (resolved.chats || resolved.users)) {
          const userOrChat = (resolved.users && resolved.users[0]) || (resolved.chats && resolved.chats[0]);
          if (userOrChat) {
            await entityRepo.saveEntity(name, userOrChat);
            entity = {
              entityId: String(userOrChat.id),
              accessHash: String(userOrChat.access_hash),
              type: userOrChat._ === 'channel' ? 'channel' : userOrChat._ === 'user' ? 'user' : 'group',
              username: userOrChat.username,
              title: userOrChat.title || `${userOrChat.first_name || ''} ${userOrChat.last_name || ''}`.trim(),
            };
          }
        }
      } catch (e) {
        console.warn(`Could not resolve username ${chatId}:`, e.message);
      }
    }

    if (entity) {
      return {
        id: entity.entityId,
        type: entity.type === 'channel' ? 'channel' : entity.type === 'user' ? 'direct' : 'group',
        title: entity.title || entity.username || entity.entityId,
        username: entity.username,
        unreadCount: 0,
        lastMessage: null,
      };
    }

    return {
      id: String(chatId),
      type: 'direct',
      title: String(chatId),
      username: null,
      unreadCount: 0,
      lastMessage: null,
    };
  }

  async getMessages(name, chatId, limit = 20, beforeId = null) {
    const client = this.getClient(name);
    const entity = await this.resolvePeer(name, chatId);

    let peer;
    if (entity.type === 'channel') {
      peer = {
        _: 'inputPeerChannel',
        channel_id: parseInt(entity.entityId),
        access_hash: parseInt(entity.accessHash || '0'),
      };
    } else if (entity.type === 'chat') {
      peer = {
        _: 'inputPeerChat',
        chat_id: parseInt(entity.entityId),
      };
    } else {
      peer = {
        _: 'inputPeerUser',
        user_id: parseInt(entity.entityId),
        access_hash: parseInt(entity.accessHash || '0'),
      };
    }

    const res = await client.call('messages.getHistory', {
      peer,
      offset_id: beforeId ? parseInt(beforeId) : 0,
      offset_date: 0,
      add_offset: 0,
      limit,
      max_id: 0,
      min_id: 0,
      hash: '0',
    });

    const messages = (res.messages || []).map(m => ({
      id: String(m.id),
      chatId: String(chatId),
      from: String(m.from_id ? (m.from_id.user_id || m.from_id) : m.id),
      fromMe: Boolean(m.out),
      timestamp: m.date || Math.floor(Date.now() / 1000),
      text: m.message || null,
      mediaType: m.media ? m.media._ : null,
      replyToMessageId: m.reply_to_msg_id ? String(m.reply_to_msg_id) : null,
    }));

    return {
      chatId: String(chatId),
      messages,
    };
  }

  async sendMessageText(name, chatId, text, replyToMessageId = null) {
    const client = this.getClient(name);
    const entity = await this.resolvePeer(name, chatId);

    let res;
    if (entity.type === 'user') {
      res = await client.sendMessageToUser(entity.entityId, entity.accessHash || '0', text, {
        reply_to_msg_id: replyToMessageId ? parseInt(replyToMessageId) : undefined,
      });
    } else {
      res = await client.sendMessage(entity.entityId, text, {
        reply_to_msg_id: replyToMessageId ? parseInt(replyToMessageId) : undefined,
      });
    }

    const msgId = String((res && (res.id || (res.updates && res.updates[0] && res.updates[0].id))) || Date.now());

    return {
      success: true,
      message: {
        id: msgId,
        chatId: String(chatId),
        from: String(client.token ? client.token.split('_').pop() : 'me'),
        fromMe: true,
        timestamp: Math.floor(Date.now() / 1000),
        text,
        mediaType: null,
        replyToMessageId: replyToMessageId || null,
      },
    };
  }

  async sendMessageMedia(name, chatId, mediaReq) {
    const client = this.getClient(name);
    const entity = await this.resolvePeer(name, chatId);
    const caption = mediaReq.caption || '';

    // Handle document/photo media sending
    let res;
    if (entity.type === 'user') {
      res = await client.sendPhotoToUser(entity.entityId, entity.accessHash || '0', mediaReq.url || mediaReq.data, caption);
    } else {
      res = await client.sendPhoto(entity.entityId, mediaReq.url || mediaReq.data, caption);
    }

    const msgId = String((res && (res.id || (res.updates && res.updates[0] && res.updates[0].id))) || Date.now());

    return {
      success: true,
      message: {
        id: msgId,
        chatId: String(chatId),
        from: String(client.token ? client.token.split('_').pop() : 'me'),
        fromMe: true,
        timestamp: Math.floor(Date.now() / 1000),
        text: caption,
        mediaType: 'image',
        replyToMessageId: mediaReq.replyToMessageId || null,
      },
    };
  }

  async resolvePeer(name, chatId) {
    const client = this.getClient(name);
    const isUsername = typeof chatId === 'string' && (chatId.startsWith('@') || isNaN(Number(chatId)));
    let entity = isUsername
      ? await entityRepo.getEntityByUsername(name, chatId)
      : await entityRepo.getEntityById(name, chatId);

    if (!entity && isUsername) {
      try {
        const resolved = await client.resolveUsername(chatId.replace(/^@/, ''));
        const userOrChat = (resolved.users && resolved.users[0]) || (resolved.chats && resolved.chats[0]);
        if (userOrChat) {
          await entityRepo.saveEntity(name, userOrChat);
          entity = {
            entityId: String(userOrChat.id),
            accessHash: String(userOrChat.access_hash),
            type: userOrChat._ === 'channel' ? 'channel' : userOrChat._ === 'user' ? 'user' : 'group',
            username: userOrChat.username,
          };
        }
      } catch (e) {
        console.warn(`Resolve username failed for ${chatId}:`, e.message);
      }
    }

    if (!entity) {
      entity = {
        entityId: String(chatId).replace(/^@/, ''),
        accessHash: '0',
        type: 'user',
        username: isUsername ? chatId : null,
      };
    }

    return entity;
  }
}

module.exports = new SessionManager();
