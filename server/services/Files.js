class Files {
  #path = 'server/public';
  #fs = require('fs');

  constructor(path = "../public/") {
    this.#path = path;
  }


  async listFiles() {
    const promise = new Promise((resolve, reject) => {
      this.#fs.readdir(this.#path, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
    return promise;
  }
}
module.exports = Files;