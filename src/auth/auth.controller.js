const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
} = require("./token.service")

const prisma = require("../utils/prisma")
const { findUserByEmail } = require("./auth.service")

// ==============================
// LOGIN
// ==============================
async function login(req, res) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email required" })
    }

    const user = await findUserByEmail(email)

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // 🔥 STORE SESSION (IMPORTANT FOR STAGE 3)
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    })

    return res.json({
      accessToken,
      refreshToken, // 🔥 IMPORTANT FOR CLI
      user,
    })
  } catch (err) {
    console.error("LOGIN ERROR:", err)
    return res.status(500).json({ error: err.message })
  }
}

// ==============================
// REFRESH TOKEN
// ==============================
async function refresh(req, res) {
  try {
    // CLI-safe: support both cookie + body
    const token = req.cookies.refreshToken || req.body.refreshToken

    if (!token) {
      return res.status(401).json({ error: "No refresh token" })
    }

    const session = await prisma.session.findFirst({
      where: { refreshToken: token },
    })

    if (!session) {
      return res.status(403).json({ error: "Session not found" })
    }

    if (new Date(session.expiresAt) < new Date()) {
      return res.status(403).json({ error: "Session expired" })
    }

    const decoded = verifyRefreshToken(token)

    await revokeRefreshToken(token)

    const newAccessToken = generateAccessToken(decoded)
    const newRefreshToken = generateRefreshToken(decoded)

    await prisma.session.create({
      data: {
        userId: decoded.id || decoded.userId,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
    })

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // CLI support
    })
  } catch (err) {
    console.error("REFRESH ERROR:", err)
    return res.status(403).json({ error: "Token invalid or expired" })
  }
}

module.exports = {
  login,
  refresh,
}