const Server = require('./services/FileServer');
const Files = require('./services/Files');

const files = new Files('./public/');
const fileServer = new Server(files, false);

fileServer.onConnection(() => {
  console.log('Client connected');
});

fileServer.onError((client, msg) => {
  console.log('Error occurred:', msg);
});

fileServer.onDisconnect(() => {
  console.log('Client disconnected');
});

fileServer.listen();