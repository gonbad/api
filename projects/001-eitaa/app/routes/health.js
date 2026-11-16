const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

router.get('/health', async (req, res) => {
  const pool = getPool();
  let dbStatus = 'fallback-local';
  if (pool) {
    try {
      await pool.query('SELECT 1');
      dbStatus = 'connected';
    } catch (e) {
      dbStatus = `disconnected (${e.message})`;
    }
  }

  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    version: '0.1.0',
  });
});

module.exports = router;
