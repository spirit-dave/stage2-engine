const express = require("express")
const router = express.Router()

const {
  getAllProfiles,
  searchProfiles
} = require("../controllers/profiles.controller")

// 🔥 IMPORTANT: search must come BEFORE "/"
router.get("/search", searchProfiles)

router.get("/", getAllProfiles)

module.exports = router