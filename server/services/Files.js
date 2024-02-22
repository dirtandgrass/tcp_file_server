const fs = require('fs');

class Files {
  #path = 'server/public';

  constructor(path = "../public/") {
    this.#path = path;
  }

  async writeFile(file, data) {
    const fileExists = await this.isFile(file);
    let filename = file;

    // check if the filer already exists
    // change filename to include a incrementing number
    // don't forget it may have an extension
    if (fileExists) {
      const split = file.split('.');
      const ext = split.pop();
      const name = split.join('.');
      let i = 1;
      while (await this.isFile(filename)) {
        filename = `${name}_${i}.${ext}`;
        i++;
      }
    }
    const promise = new Promise((resolve, reject) => {
      fs.writeFile(this.#path + filename, data, (err) => {
        if (err) {
          reject({err});
        } else {
          resolve({filename});
        }
      });
    });
    return promise;
  }

  async readFile(file) {
    const isFile = await this.isFile(file);
    const promise = new Promise((resolve, reject) => {
      if (!isFile) reject({err:'File not found'});

      fs.readFile(this.#path + file, 'utf-8',(err, data) => {
        if (err) {
          reject({err});
        } else {
          resolve({file,data});
        }
      });
    });

    return promise;
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