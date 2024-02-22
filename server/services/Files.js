const fs = require('fs');

class Files {
  #path = 'server/public';

  constructor(path = "../public/") {
    this.#path = path;
  }

  async listFiles() {
    const promise = new Promise((resolve, reject) => {
      fs.readdir(this.#path, async(err, files) => {
        if (err) {
          reject(err);
        } else {
          const filesOnly = await getFilesOnly(this.#path, files);
          resolve(filesOnly);
        }
      });
    });
    return promise;
  }
}

const getFilesOnly = (path, files) => {
  const promise = new Promise((resolve) => {

    const filesOnly = files.filter((file) => {
      const stats = fs.statSync(path + file);
      return stats.isFile();
    });
    resolve(filesOnly);
  });
  return promise;
};

module.exports = Files;