const Server = require('./Server');


const fileServer = new Server(4321);

fileServer.onConnection(() => {
  console.log('Client connected');
});

fileServer.onError((client, msg) => {
  console.log('Error occurred:', msg);
});