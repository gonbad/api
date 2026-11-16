const express = require('express');
const router = express.Router({ mergeParams: true });
const sessionManager = require('../services/sessionManager');

router.get('/', async (req, res, next) => {
  try {
    const { session } = req.params;
    const type = req.query.type || 'all';
    const limit = parseInt(req.query.limit, 10) || 30;
    const offset = parseInt(req.query.offset, 10) || 0;

    const list = await sessionManager.getChats(session, type, limit, offset);
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/:chatId', async (req, res, next) => {
  try {
    const { session, chatId } = req.params;
    const chat = await sessionManager.getChat(session, chatId);
    res.json(chat);
  } catch (e) {
    next(e);
  }
});

router.get('/:chatId/messages', async (req, res, next) => {
  try {
    const { session, chatId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;
    const beforeId = req.query.beforeId || null;

    const messages = await sessionManager.getMessages(session, chatId, limit, beforeId);
    res.json(messages);
  } catch (e) {
    next(e);
  }
});

router.post('/:chatId/messages/text', async (req, res, next) => {
  try {
    const { session, chatId } = req.params;
    const { text, replyToMessageId } = req.body || {};
    if (!text) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Message text is required.' });
    }
    const result = await sessionManager.sendMessageText(session, chatId, text, replyToMessageId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/:chatId/messages/media', async (req, res, next) => {
  try {
    const { session, chatId } = req.params;
    const mediaReq = req.body || {};
    if (!mediaReq.url && !mediaReq.data) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Media url or data is required.' });
    }
    const result = await sessionManager.sendMessageMedia(session, chatId, mediaReq);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
