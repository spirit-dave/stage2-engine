// routes/upload.js
const express = require("express")
const router = express.Router()
const upload = require("multer")({ dest: "uploads/" })

const { uploadCSV } = require("../controllers/upload.controller")

router.post("/", upload.single("file"), uploadCSV)

module.exports = router