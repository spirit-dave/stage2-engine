const jwt = require("jsonwebtoken")

const ACCESS_SECRET = "access-secret"
const REFRESH_SECRET = "refresh-secret"

// In-memory refresh store (replace with DB later)
let refreshTokens = []

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_SECRET, { expiresIn: "15m" })
}

function generateRefreshToken(user) {
  const token = jwt.sign(user, REFRESH_SECRET, { expiresIn: "7d" })
  refreshTokens.push(token)
  return token
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET)
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET)
}

function isRefreshTokenValid(token) {
  return refreshTokens.includes(token)
}

function revokeRefreshToken(token) {
  refreshTokens = refreshTokens.filter((t) => t !== token)
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
}