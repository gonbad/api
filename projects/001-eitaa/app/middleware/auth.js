function apiKeyAuth(req, res, next) {
  // Allow public documentation and health check
  if (req.path === '/api/health' || req.path === '/api/docs/json' || req.path.startsWith('/docs')) {
    return next();
  }

  const globalKey = process.env.GLOBAL_API_KEY || 'eitaa-bridge-master-secret-key-001';
  const queryKey = req.query.api_key || req.query.apiKey || req.query.token;
  const providedKey = req.header('X-Api-Key') || (req.header('Authorization') ? req.header('Authorization').replace(/^Bearer\s+/i, '') : null) || queryKey;

  if (!providedKey) {
    return res.status(401).json({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing API key. Provide header X-Api-Key or Authorization: Bearer <token>.',
    });
  }

  if (providedKey !== globalKey) {
    return res.status(401).json({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid API key.',
    });
  }

  next();
}

module.exports = {
  apiKeyAuth,
};
