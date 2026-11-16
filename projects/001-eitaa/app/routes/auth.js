const express = require('express');
const router = express.Router({ mergeParams: true });
const sessionManager = require('../services/sessionManager');

router.post('/request-code', async (req, res, next) => {
  try {
    const { session } = req.params;
    const { phone } = req.body || {};
    if (!phone) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Phone number is required.' });
    }
    const result = await sessionManager.requestCode(session, phone);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/submit-code', async (req, res, next) => {
  try {
    const { session } = req.params;
    const { code, phoneCodeHash } = req.body || {};
    if (!code) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: 'Verification code is required.' });
    }
    const result = await sessionManager.submitCode(session, code, phoneCodeHash);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/submit-password', async (req, res, next) => {
  try {
    const { session } = req.params;
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ statusCode: 400, error: 'Bad Request', message: '2FA password is required.' });
    }
    const result = await sessionManager.submitPassword(session, password);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
