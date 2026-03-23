const fs = require("fs");
const path = require("path");

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : __dirname;

function ensureDataDir() {
  if (dataDir === __dirname) {
    return;
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function resolveDataFile(fileName) {
  ensureDataDir();
  return path.join(dataDir, fileName);
}

module.exports = {
  dataDir,
  ensureDataDir,
  resolveDataFile
};
