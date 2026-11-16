const Obfuscated = require('../../src/transport/obfuscated');

class Transport extends Obfuscated {
  constructor(dc, crypto) {
    super();

    this.connect();
  }

  get isAvailable() {
    return true;
  }

  connect() {
    this.stream = new Uint8Array();
    this.emit('open');
  }


  async send(bytes) {
    // List of Eitaa servers for random selection
    const servers = [
      "https://hasan.eitaa.ir/eitaa/",
      "https://hosna.eitaa.com/eitaa/",
      "https://armita.eitaa.com/eitaa/",
      "https://majid.eitaa.com/eitaa/",
      "https://alireza.eitaa.com/eitaa/",
      "https://mostafa.eitaa.com/eitaa/",
      "https://sajad.eitaa.ir/eitaa/",
      "https://bagher.eitaa.ir/eitaa/",
      "https://sadegh.eitaa.ir/eitaa/",
      "https://kazem.eitaa.ir/eitaa/"
    ];

    // Randomly select a server
    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    
    const response = await fetch(randomServer, {
      method: 'POST', body: bytes,
    });

    return await response.arrayBuffer();
  }
}

module.exports = Transport;
