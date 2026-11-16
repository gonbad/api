const express = require('express');
const router = express.Router();
const sessionManager = require('../services/sessionManager');

router.get('/', async (req, res, next) => {
  try {
    const list = await sessionManager.listSessions();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, start, webhookUrl, config } = req.body || {};
    if (!name) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Session name is required' });
    }
    const created = await sessionManager.createSession(name, { start, webhookUrl, config });
    res.status(201).json(created);
  } catch (e) {
    if (e.message && e.message.includes('already exists')) {
      return res.status(409).json({ statusCode: 409, error: 'Conflict', message: e.message });
    }
    next(e);
  }
});

router.get('/:session', async (req, res, next) => {
  try {
    const info = await sessionManager.getSessionInfo(req.params.session);
    if (!info) {
      return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Session '${req.params.session}' not found` });
    }
    res.json(info);
  } catch (e) {
    next(e);
  }
});

router.delete('/:session', async (req, res, next) => {
  try {
    const info = await sessionManager.getSessionInfo(req.params.session);
    if (!info) {
      return res.status(404).json({ statusCode: 404, error: 'Not Found', message: `Session '${req.params.session}' not found` });
    }
    const result = await sessionManager.deleteSession(req.params.session);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/:session/start', async (req, res, next) => {
  try {
    const info = await sessionManager.startSession(req.params.session);
    res.json(info);
  } catch (e) {
    next(e);
  }
});

router.post('/:session/stop', async (req, res, next) => {
  try {
    const info = await sessionManager.stopSession(req.params.session);
    res.json(info);
  } catch (e) {
    next(e);
  }
});

router.post('/:session/logout', async (req, res, next) => {
  try {
    const result = await sessionManager.logoutSession(req.params.session);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
