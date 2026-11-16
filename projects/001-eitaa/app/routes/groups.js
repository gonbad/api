const express = require('express');
const router = express.Router({ mergeParams: true });
const sessionManager = require('../services/sessionManager');

router.get('/', async (req, res, next) => {
  try {
    const { session } = req.params;
    const limit = parseInt(req.query.limit, 10) || 30;
    const result = await sessionManager.getChats(session, 'group', limit, 0);
    res.json(result.chats);
  } catch (e) {
    next(e);
  }
});

router.post('/:groupId/messages/text', async (req, res, next) => {
  try {
    const { session, groupId } = req.params;
    const { text, replyToMessageId } = req.body || {};
    if (!text) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Message text is required.' });
    }
    const result = await sessionManager.sendMessageText(session, groupId, text, replyToMessageId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
