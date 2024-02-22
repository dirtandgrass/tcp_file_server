const Server = require('./services/Server');
const Files = require('./services/Files');


const files = new Files('./public/');


(async() => {
  const fileList = await files.listFiles();
  console.log(fileList);
})();

// const fileServer = new Server(4321);

// fileServer.onConnection(() => {
//   console.log('Client connected');
// });

// fileServer.onError((client, msg) => {
//   console.log('Error occurred:', msg);
// });