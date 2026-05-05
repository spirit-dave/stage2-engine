// src/utils/cache.js
const NodeCache = require("node-cache")

const cache = new NodeCache({
  stdTTL: 60, // 1 minute
})

module.exports = caches