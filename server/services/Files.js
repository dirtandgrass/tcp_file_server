const fs = require('fs');

class Files {
  #path = 'server/public';

  constructor(path = "../public/") {
    this.#path = path;
  }

  async isFile(file) {
    const promise = new Promise((resolve) => {
      fs.stat(this.#path + file, (err, stats) => {
        if (err) {
          resolve(false);
        } else {
          resolve(stats.isFile());
        }
      });
    });

    return promise;
  }

  async listFiles() {
    const promise = new Promise((resolve, reject) => {
      fs.readdir(this.#path, async(err, files) => {
        if (err) {
          reject(err);
        } else {
          let filesOnly = [];
          for (let file of files) {
            if (await this.isFile(file)) {
              filesOnly.push(file);
            }
          }
          resolve(filesOnly);
        }
      });
    });
    return promise;
  }
}



module.exports = Files;