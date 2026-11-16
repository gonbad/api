const Obfuscated = require('./obfuscated');

class Transport extends Obfuscated {
  constructor(dc, crypto, debug = false, serverUrl = null) {
    super();

    this.dc = dc;
    this.crypto = crypto;
    this.debug = debug;
    
    // Server lists based on debug mode
    this.dcClients = this.debug ? 
      ["https://dev3.eitaa.com/eitaa/index.php"] : 
      [
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
    
    this.dcDownloads = this.debug ? 
      ["https://mohsen.eitaa.com/eitaa/"] : 
      [
        "https://mohsen.eitaa.com/eitaa/", 
        "https://ghasem.eitaa.com/eitaa/", 
        "https://hadi.eitaa.com/eitaa/", 
        "https://hossein.eitaa.com/eitaa/", 
        "https://vahid.eitaa.com/eitaa/"
      ];
    
    this.serverUrl = serverUrl || this.getRandomServer(this.dcClients);
    this.connect();
  }

  get isAvailable() {
    return true;
  }

  connect() {
    this.stream = new Uint8Array();
    this.emit('open');
  }

  getRandomServer(serverList) {
    const randomIndex = Math.floor(Math.random() * serverList.length);
    return serverList[randomIndex];
  }

  async send(bytes) {
    // Stick to current serverUrl, fallback to random if not set
    const serverUrl = this.serverUrl || this.getRandomServer(this.dcClients);
    this.serverUrl = serverUrl;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(serverUrl, {
        method: 'POST', 
        body: bytes,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/octet-stream',
          'User-Agent': 'EitaaClient/1.0'
        }
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          // Read error text from response
          const errorText = await response.text();
          if (errorText && errorText.length > 0) {
            // Limit error text length
            const errorPreview = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText;
            errorMessage += ` - ${errorPreview}`;
          }
        } catch (e) {
          // Ignore if we can't read the error text
          console.error('Could not read error response:', e.message);
        }
        throw new Error(errorMessage);
      }

      return await response.arrayBuffer();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout after 30 seconds');
      }
      
      throw error;
    }
  }
}

module.exports = Transport;
