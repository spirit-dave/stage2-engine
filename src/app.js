const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")

const profileRoutes = require("./routes/profiles")
const { login, refresh } = require("./auth/auth.controller")
const { authenticate } = require("./auth/auth.middleware")

const app = express()

// ===== SECURITY: RATE LIMITING =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: {
    error: "Too many requests, please try again later",
  },
})

// Apply globally
app.use(limiter)

// ===== LOGGING =====
app.use(morgan("dev"))

// ===== CORS (for cookies) =====
app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

// ===== AUTH ROUTES =====
app.post("/api/v1/auth/login", login)
app.post("/api/v1/auth/refresh", refresh)

// ===== PROTECTED ROUTES =====
app.use("/api/v1/profiles", authenticate, profileRoutes)

module.exports = app