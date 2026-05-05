const fs = require("fs-extra")
const os = require("os")
const path = require("path")

const CONFIG_DIR = path.join(os.homedir(), ".insighta")
const CONFIG_FILE = path.join(CONFIG_DIR, "credentials.json")

function saveConfig(data) {
  fs.ensureDirSync(CONFIG_DIR)
  fs.writeJsonSync(CONFIG_FILE, data)
}

function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return null
  return fs.readJsonSync(CONFIG_FILE)
}

function clearConfig() {
  fs.removeSync(CONFIG_FILE)
}

module.exports = {
  saveConfig,
  getConfig,
  clearConfig,
}