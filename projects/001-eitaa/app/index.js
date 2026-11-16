const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const healthRoutes = require('./routes/health');
const sessionsRoutes = require('./routes/sessions');
const authRoutes = require('./routes/auth');
const chatsRoutes = require('./routes/chats');
const channelsRoutes = require('./routes/channels');
const groupsRoutes = require('./routes/groups');
const { apiKeyAuth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const openApiSpecPath = path.resolve(__dirname, '../contract/openapi.json');
let openApiSpec = {};
if (fs.existsSync(openApiSpecPath)) {
  try {
    openApiSpec = JSON.parse(fs.readFileSync(openApiSpecPath, 'utf-8'));
  } catch (e) {
    console.error('Failed to parse openapi.json:', e);
  }
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Swagger & OpenAPI Specification
app.get('/api/docs/json', (req, res) => {
  try {
    const freshSpec = JSON.parse(fs.readFileSync(openApiSpecPath, 'utf-8'));
    res.json(freshSpec);
  } catch (e) {
    res.json(openApiSpec);
  }
});

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  let spec = openApiSpec;
  try {
    spec = JSON.parse(fs.readFileSync(openApiSpecPath, 'utf-8'));
  } catch (e) {}
  const key = process.env.GLOBAL_API_KEY || 'eitaa-bridge-master-secret-key-001';
  swaggerUi.setup(spec, {
    customSiteTitle: 'Eitaa Bridge API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 1,
    },
    customJsStr: `
      window.addEventListener('load', function() {
        var interval = setInterval(function() {
          if (window.ui && window.ui.preauthorizeApiKey) {
            clearInterval(interval);
            window.ui.preauthorizeApiKey('ApiKeyAuth', '${key}');
          }
        }, 200);
      });
    `,
  })(req, res, next);
});

app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Health check (unauthenticated)
app.use('/api', healthRoutes);

// Apply API Key Authentication to all /api endpoints below
app.use('/api', apiKeyAuth);

// Session and Auth routes
app.use('/api/sessions/:session/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);

// Channels, Groups, Chats routes
app.use('/api/:session/channels', channelsRoutes);
app.use('/api/:session/groups', groupsRoutes);
app.use('/api/:session/chats', chatsRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
