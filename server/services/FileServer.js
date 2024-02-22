
class FileServer {
  #net = require('net');
  #clients = []; // active connections
  #port;
  #server; // net server object
  #fileService;

  #callbacks = {
    onConnection: [],
    onDisconnect: [],
    onError: [],
  };

  #serverCallbacks = {
    onLog: [],
  };

  // simple protocol, map of type/action to server response
  #clientActions = new Map([
    ['list',
      async(client) => {
        const files = await this.#fileService.listFiles();
        client.write(JSON.stringify({type: 'list', payload: files}));
      }
    ],['get',async(client, payload) => {
      const requestFile = payload.file;
      const {file, data} = await this.#fileService.readFile(requestFile);
      client.write(JSON.stringify({type: 'get', payload: {file, data}}));
    }],['put',async(client, {file, data}) => {
      const filename = await this.#fileService.writeFile(file, data);
      client.write(JSON.stringify({type: 'put', payload: filename}));
    }]
  ]);

  // trigger all client based callbacks of a certain type
  #triggerOnClient(type,client, params = []) {
    for (const callback of this.#callbacks[type]) callback(client, ...params);
  }

  #triggerOnServer(type, params = []) {
    for (const callback of this.#serverCallbacks[type]) callback(this, ...params);
  }

  // register callback for client connected event
  onConnection(callback) {
    this.#callbacks.onConnection.push(callback);
  }

  // register callback for client disconnected event
  onDisconnect(callback) {
    this.#callbacks.onDisconnect.push(callback);
  }

  // register callback for client error event
  onError(callback) {
    this.#callbacks.onError.push(callback);
  }

  // register callback for server log event
  onLog(callback) {
    this.#serverCallbacks.onLog.push(callback);
  }

  // handle new client connections
  #clientConnected(client) {
    this.#triggerOnClient('onConnection', client);
    this.#clients.push(client);
    client.setEncoding('utf8');

    client.on('data', (data) => {
      if (typeof data === 'string') {

        try {
          const jsonData = JSON.parse(data);
          if (!jsonData || !jsonData.type) return;

          if (this.#clientActions.has(jsonData.type)) {
            this.#triggerOnServer('onLog', [`Received: [${jsonData.type}] request`]);
            this.#clientActions.get(jsonData.type)(client, jsonData.payload); // payload is optional
          }
        } catch (error) {
          const message = 'Invalid JSON';
          this.#triggerOnClient('onError', client, [message, error]);
        }

      }
    });
    client.on('end', () => {
      this.#triggerOnClient('onDisconnect', client);
    });
  }

  listen() {
    if (this.#server.listening) throw new Error('Server already listening');
    this.#server.listen(this.#port, () => {
      this.#triggerOnServer('onLog', [`Server listening on port ${this.#port}!`]);
    });
  }

  constructor(fileService, start = true, port = 4996) {
    this.#port = port;
    this.#fileService = fileService;

    this.#server = this.#net.createServer(this.#clientConnected.bind(this));

    if (start) {
      this.listen();
    }
  }
}

module.exports = FileServer;