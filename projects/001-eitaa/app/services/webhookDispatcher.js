const crypto = require('crypto');

class WebhookDispatcher {
  async dispatch(webhookUrl, sessionName, eventName, payload) {
    if (!webhookUrl) return;

    const eventEnvelope = {
      event: eventName,
      session: sessionName,
      timestamp: Math.floor(Date.now() / 1000),
      payload,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EitaaBridgeGateway/0.1',
          'X-Event-Name': eventName,
          'X-Session-Id': sessionName,
        },
        body: JSON.stringify(eventEnvelope),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`[Webhook] Target ${webhookUrl} returned HTTP ${response.status} for event ${eventName}`);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[Webhook] Delivery failed for ${webhookUrl} (${eventName}): ${err.message}`);
    }
  }

  async emitSessionStatus(sessionName, webhookUrl, status, user = null) {
    await this.dispatch(webhookUrl, sessionName, 'session.status', {
      status,
      user: user || null,
    });
  }

  async emitMessage(sessionName, webhookUrl, message) {
    await this.dispatch(webhookUrl, sessionName, 'message.created', message);
  }
}

module.exports = new WebhookDispatcher();
