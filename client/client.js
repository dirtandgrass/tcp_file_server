const net = require("net");
const fs = require("fs");
const path = "./files/";

const conn = net.createConnection({
  host: "localhost",
  port: 4996,
});

//conn.setEncoding("utf8"); // interpret data as text

conn.on("connect", async() => {

  // request a list of files
  // const reqList = {type: 'list'};
  // conn.write(JSON.stringify(reqList));

  const reqFile = {type: 'get', payload: {file: 'endor.jpg'}};
  conn.write(JSON.stringify(reqFile));

  // const reqPut = {type: 'put', payload: {file: 'test2.txt'}};
  // conn.write(JSON.stringify(reqPut));
  // (await fs.createReadStream('./files/test2.txt')).pipe(conn);


});

conn.on("data", (data) => {


  const first = data.toString('utf8',0,1);
  if (first === '{') {
    data = data.toString('utf8');
    try {
      const packet = JSON.parse(data);

      switch (packet.type) {
      case 'list':
        console.log('Available Files:', packet.payload);
        break;
      case 'get':
        console.log('Retrieving File:', packet.payload.file);

        conn.pipe(fs.createWriteStream(path + packet.payload.file));
        conn.on('error', (err) => {
          console.log('Error:', err.message);
        });
        break;
      case 'put':
        console.log('File Saved as:', packet.payload);

        break;
      default:
        console.log('Unknown packet type:', packet.type);
      }
    } catch (err) {

      console.log(err.message);
    }
  }

});
