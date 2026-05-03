const express = require("express")
const cors = require("cors")

const profileRoutes = require("./routes/profiles")

const app = express()

app.use(cors({ origin: "*" }))
app.use(express.json())

app.use("/api/profiles", profileRoutes)

module.exports = app