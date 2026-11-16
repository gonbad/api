const EventEmitter = require('events');
const RPC = require('./rpc');
const Crypto = require('./crypto');
const baseDebug = require('./utils/common/base-debug');

const debug = baseDebug.extend('client');

const TEST_DC_LIST = [
  {
    id: 2,
    ip: '2.189.58.32',
    port: 443,
    test: true,
  },
];

const PRODUCTION_DC_LIST = [
  {
    id: 2,
    ip: '2.189.58.32',
    port: 443,
    test: true,
  },
];

class Client extends EventEmitter {
  constructor(options = {}) {
    super();

    const { token, imei, test = false, sessionId, onTokenRefresh, serverUrl } = options;

    if (!imei) {
      throw new Error('IMEI is required');
    }

    // Token is optional for initial connection (will be set after authentication)
    if (!token) {
      console.log('⚠️  Warning: No token provided, using placeholder for initial connection');
    }

    this.token = token;
    this.imei = imei;
    this.test = test;
    this.sessionId = sessionId; // Store session ID for token refresh
    this.onTokenRefresh = onTokenRefresh; // Callback to update token in DB
    this.serverUrl = serverUrl || null;
    this.dcList = test ? TEST_DC_LIST : PRODUCTION_DC_LIST;

    this.rpcs = new Map();
    this.crypto = new Crypto();
    this.isConnected = false;
    this.isAuthorized = false;

    debug('Client initialized');
  }

  async connect() {
    try {
      const dcId = 2;
      const rpc = this.getRPC(dcId);
      
      this.isConnected = true;
      this.emit('connected');
      
      debug('Connected to Eitaa');
      return true;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async disconnect() {
    this.isConnected = false;
    this.isAuthorized = false;
    this.rpcs.clear();
    this.emit('disconnected');
    debug('Disconnected from Eitaa');
  }

  getRPC(dcId) {
    if (this.rpcs.has(dcId)) {
      return this.rpcs.get(dcId);
    }

    const dc = this.dcList.find(({ id }) => id === dcId);

    if (!dc) {
      throw new Error(`Data center ${dcId} not found`);
    }

    const Transport = require('./transport');
    const transport = new Transport(dc, this.crypto, false, this.serverUrl);
    this.serverUrl = transport.serverUrl;

    const rpc = new RPC({
      dc,
      context: this,
      transport,
      token: this.token,
      imei: this.imei,
    });

    this.rpcs.set(dcId, rpc);
    return rpc;
  }

  async call(method, params = {}, retryCount = 0) {
    if (!this.isConnected) {
      await this.connect();
    }

    const dcId = 2;
    const rpc = this.getRPC(dcId);

    try {
      const result = await rpc.call(method, params);
      
      // Check if token needs to be refreshed
      if (result && (result._ === 'mt_eitaa_token_updating' || result._ === 'mt_eitaa_updates_expire_token')) {
        console.log('🔄 Token expired/updating, refreshing token...');
        
        // Prevent infinite retry loop
        if (retryCount >= 2) {
          throw new Error('Token refresh failed after multiple attempts');
        }

        // Refresh token
        const refreshResult = await this.refreshToken();
        
        if (refreshResult && refreshResult.token) {
          // Update token in client
          this.token = refreshResult.token;
          
          // Update token in all RPC instances
          if (this.rpcs && this.rpcs.size > 0) {
            for (const rpcInstance of this.rpcs.values()) {
              rpcInstance.token = refreshResult.token;
            }
          }
          
          // Update token in database via callback
          if (this.onTokenRefresh && typeof this.onTokenRefresh === 'function') {
            try {
              await this.onTokenRefresh(this.sessionId, refreshResult.token);
              console.log('✅ Token updated in database');
            } catch (dbError) {
              console.error('❌ Error updating token in database:', dbError);
              // Continue anyway - token is updated in memory
            }
          }
          
          // Retry the original request with new token
          console.log('🔄 Retrying request with new token...');
          return await this.call(method, params, retryCount + 1);
        } else {
          throw new Error('Token refresh failed: no token in response');
        }
      }
      
      return result;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Authentication methods - Eitaa specific
  async sendCode(phoneNumber, apiId, apiHash) {
    return await this.call('auth.sendCode', {
      phone_number: phoneNumber,
      api_id: apiId,
      api_hash: apiHash,
      settings: {
        _: 'codeSettings',
      },
    });
  }

  async signIn(phoneNumber, phoneCode, phoneCodeHash = null) {
    const params = {
      phone_number: phoneNumber,
      phone_code: phoneCode,
    };
    
    // Add phone_code_hash if provided (from sendCode response)
    if (phoneCodeHash) {
      params.phone_code_hash = phoneCodeHash;
    }
    
    const result = await this.call('auth.signIn', params);
    
    if (result.token) {
      this.token = result.token;
      if (this.rpcs && this.rpcs.size > 0) {
        for (const rpcInstance of this.rpcs.values()) {
          rpcInstance.token = result.token;
        }
      }
      this.isAuthorized = true;
      this.emit('authorized', result);
    }
    
    return result;
  }

  async signUp(phoneNumber, phoneCode, firstName, lastName, phoneCodeHash = null, appInfo = null) {
    const params = {
      phone_number: phoneNumber,
      phone_code: phoneCode,
      first_name: firstName,
      last_name: lastName,
    };
    
    // Add phone_code_hash if provided
    if (phoneCodeHash) {
      params.phone_code_hash = phoneCodeHash;
    }
    
    // Add Eitaa app info if provided
    if (appInfo) {
      params.app_info = appInfo;
    }
    
    const result = await this.call('auth.signUp', params);
    
    if (result.token) {
      this.isAuthorized = true;
      this.emit('authorized', result);
    }
    
    return result;
  }

  async logout() {
    const result = await this.call('auth.logOut');
    this.isAuthorized = false;
    this.emit('logged_out');
    return result;
  }

  // Eitaa specific methods
  async refreshToken() {
    // Use direct RPC call to bypass auto-refresh mechanism
    // (to prevent infinite recursion if refreshToken itself needs refreshing)
    if (!this.isConnected) {
      await this.connect();
    }

    const dcId = 2;
    const rpc = this.getRPC(dcId);
    
    const result = await rpc.call('eitaaRefreshToken', {
      app_info: {
        _: "eitaaAppInfo",
        build_version: "v3.5",
        device_model: "miti",
        system_version: "v0.1",
        app_version: "v0.1",
        lang_code: "fa",
        sign: "",
      },
    });
    
    return result;
  }

  async getUpdatesExpireToken() {
    return await this.call('eitaaUpdatesExpireToken');
  }

  async getTokenUpdating() {
    return await this.call('eitaaTokenUpdating');
  }

  // User methods - Eitaa specific
  async getMe() {
    return await this.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    });
  }

  // Account methods
  async updateProfile(firstName, lastName, about = '') {
    return await this.call('account.updateProfile', {
      first_name: firstName,
      last_name: lastName,
      about,
    });
  }

  async updateStatus(offline = false) {
    return await this.call('account.updateStatus', {
      offline,
    });
  }

  async getWallPapers() {
    return await this.call('account.getWallPapers');
  }

  // Chat methods - Eitaa specific
  async getChats(limit = 100) {
    return await this.call('messages.getDialogs', {
      exclude_pinned: false,
      offset_date: 0,
      offset_id: 0,
      offset_peer: {
        _: 'inputPeerEmpty'
      },
      limit: limit,
      hash: BigInt(0)
    });
  }


  async getChat(chatId) {
    return await this.call('messages.getFullChat', {
      chat_id: chatId,
    });
  }

  // Message methods - Eitaa specific
  async sendMessage(chatId, text, options = {}) {
    return await this.call('messages.sendMessage', {
      peer: {
        _: 'inputPeerChannel',
        channel_id: chatId,
      },
      message: text,
      random_id: Math.floor(Math.random() * 1000000000),
      ...options,
    });
  }

  async sendMessageToUser(userId, accessHash, text, options = {}) {
    return await this.call('messages.sendMessage', {
      peer: {
        _: 'inputPeerUser',
        user_id: parseInt(userId),
        access_hash: parseInt(accessHash),
      },
      message: text,
      random_id: Math.floor(Math.random() * 1000000000),
      ...options,
    });
  }

  async sendPhotoToUser(userId, accessHash, photo, caption = '', options = {}) {
    return await this.call('messages.sendMedia', {
      peer: {
        _: 'inputPeerUser',
        user_id: parseInt(userId),
        access_hash: parseInt(accessHash),
      },
      media: {
        _: 'inputMediaUploadedPhoto',
        file: photo,
      },
      message: caption,
      random_id: Math.floor(Math.random() * 1000000000),
      ...options,
    });
  }

  async getMessages(chatId, limit = 100) {
    return await this.call('messages.getHistory', {
      peer: {
        _: 'inputPeerChannel',
        channel_id: chatId,
      },
      limit,
    });
  }

  // Channel methods - Eitaa specific
  async getChannels() {
    return await this.call('channels.getChannels', {
      id: [],
    });
  }

  async getChannelMessages(channelId, accessHash, messageIds) {
    return await this.call('channels.getMessages', {
      channel: {
        _: 'inputChannel',
        channel_id: parseInt(channelId),
        access_hash: parseInt(accessHash),
      },
      id: messageIds.map(id => ({
        _: 'inputMessageID',
        id: parseInt(id)
      })),
    });
  }

  async resolveUsername(username) {
    return await this.call('contacts.resolveUsername', {
      username: username
    });
  }

  async joinChannel(channelId) {
    return await this.call('channels.joinChannel', {
      channel: {
        _: 'inputChannel',
        channel_id: channelId,
      },
    });
  }

  async leaveChannel(channelId) {
    return await this.call('channels.leaveChannel', {
      channel: {
        _: 'inputChannel',
        channel_id: channelId,
      },
    });
  }

  // Get recent channel participants (users who recently joined)
  async getRecentParticipants(channelId, accessHash, limit = 100, offset = 0) {
    return await this.call('channels.getParticipants', {
      channel: {
        _: 'inputChannel',
        channel_id: parseInt(channelId),
        access_hash: parseInt(accessHash),
      },
      filter: {
        _: 'channelParticipantsRecent'
      },
      offset: offset,
      limit: limit,
      hash: BigInt(0)
    });
  }

  // Get all channel participants using search filter (empty query = all)
  async getAllParticipants(channelId, accessHash, limit = 100, offset = 0) {
    return await this.call('channels.getParticipants', {
      channel: {
        _: 'inputChannel',
        channel_id: parseInt(channelId),
        access_hash: parseInt(accessHash),
      },
      filter: {
        _: 'channelParticipantsSearch',
        q: '' // Empty query to get all participants
      },
      offset: offset,
      limit: limit,
      hash: BigInt(0)
    });
  }

  // File methods - Eitaa specific
  async sendPhoto(chatId, photo, caption = '') {
    return await this.call('messages.sendMedia', {
      peer: {
        _: 'inputPeerChannel',
        channel_id: chatId,
      },
      media: {
        _: 'inputMediaUploadedPhoto',
        file: photo,
        caption,
      },
      random_id: Math.floor(Math.random() * 1000000000),
    });
  }

  async sendDocument(chatId, document, caption = '') {
    return await this.call('messages.sendMedia', {
      peer: {
        _: 'inputPeerChannel',
        channel_id: chatId,
      },
      media: {
        _: 'inputMediaUploadedDocument',
        file: document,
        caption,
      },
      random_id: Math.floor(Math.random() * 1000000000),
    });
  }

  // Live streaming methods - Eitaa specific
  async getLiveMedia() {
    return await this.call('liveGetMedia');
  }

  // Contacts methods - Eitaa specific
  async importContacts(contacts) {
    return await this.call('contacts.importContacts', {
      contacts,
    });
  }

  async deleteContactsByPhones(phoneNumbers) {
    return await this.call('contacts.deleteByPhones', {
      phones: phoneNumbers,
    });
  }

  // Utility methods
  isReady() {
    return this.isConnected && this.isAuthorized;
  }

  getConnectionState() {
    return {
      connected: this.isConnected,
      authorized: this.isAuthorized,
      ready: this.isReady(),
    };
  }
}

module.exports = Client;
