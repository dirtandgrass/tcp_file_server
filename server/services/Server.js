
class Server {
  #net = require('net');
  #clients = []; // active connections
  #port;
  #server; // net server object

  #callbacks = {
    onConnection: [],
    onDisconnect: [],
    onError: []
  };

  // simple protocol, map of type/action to server response
  #clientActions = new Map([
    ['message',
      (client, payload) => {
        console.log('Message from client: ', payload);
        this.#clients.forEach((c) => {
          if (c !== client) {
            c.write(JSON.stringify({
              type: 'message',
              payload
            }));
          }
        });
      }
    ]
  ]);

  // trigger all callbacks of a certain type
  #triggerOnClient(type,client, params = []) {
    for (const callback of this.#callbacks[type]) callback(client, ...params);
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

  // handle new client connections
  #clientConnected(client) {
    this.#triggerOnClient('onConnection', client);
    this.#clients.push(client);
    client.setEncoding('utf8'); // todo: set it back for file transfer?

    client.on('data', (data) => {
      if (typeof data === 'string') {
        try {
          const jsonData = JSON.parse(data);
          if (!jsonData || !jsonData.type || !jsonData.payload) return;

          if (this.#clientActions.has(jsonData.type)) {
            this.#clientActions.get(jsonData.type)(client, jsonData.payload);
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
    this.#server.listen(this.#port, () => {
      console.log(`Server listening on port ${this.#port}!`);
    });
  }

  constructor(port = 4996, start = true) {
    this.#port = port;


    this.#server = this.#net.createServer(this.#clientConnected.bind(this));

    if (start) {
      this.listen();
    }
  }
}

module.exports = Server;