const Client = require('../../src/client');

class EitaaClient extends Client {
  constructor(options = {}) {
    super(options);
  }
}

module.exports = EitaaClient;
