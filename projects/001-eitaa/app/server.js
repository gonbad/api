require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = require('./index');
const { initDb } = require('./db');
const sessionManager = require('./services/sessionManager');
const sessionRepo = require('./db/sessionRepository');

const PORT = parseInt(process.env.PORT, 10) || 8016;

async function bootstrap() {
  console.log('--- Initializing Eitaa Bridge Gateway ---');
  await initDb();

  // If local .auth_state.json exists with active token, pre-seed 'default' session if not present
  const authStatePath = path.resolve(__dirname, '../.auth_state.json');
  if (fs.existsSync(authStatePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(authStatePath, 'utf-8'));
      if (state.token) {
        const existingDefault = await sessionRepo.getSession('default');
        if (!existingDefault) {
          console.log(`Pre-seeding authenticated session 'default' for user ${state.user ? state.user.first_name : 'verified'}...`);
          await sessionRepo.saveSession({
            name: 'default',
            status: 'WORKING',
            phone: state.phone,
            token: state.token,
            imei: state.imei,
            serverUrl: state.serverUrl,
            webhookUrl: process.env.WEBHOOK_URL || null,
            user: state.user || null,
          });
        }
      }
    } catch (e) {
      console.warn('Could not read .auth_state.json:', e.message);
    }
  }

  await sessionManager.init();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gateway service is running on http://0.0.0.0:${PORT}`);
    console.log(`📖 Swagger UI available at http://0.0.0.0:${PORT}/docs`);
    console.log(`📄 OpenAPI specification at http://0.0.0.0:${PORT}/api/docs/json`);
  });

  const shutdown = async () => {
    console.log('Gracefully stopping gateway service...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (require.main === module) {
  bootstrap().catch(err => {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  });
}

module.exports = { bootstrap };
