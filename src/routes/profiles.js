const express = require("express")
const router = express.Router()

const {
  getAllProfiles,
  searchProfiles,
} = require("../controllers/profiles.controller")

const {
  authenticate,
  authorize,
} = require("../auth/auth.middleware")

const ROLES = require("../utils/roles")

// 🔍 Search (both roles allowed)
router.get(
  "/search",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.ANALYST),
  searchProfiles
)

// 📄 Get all profiles (both roles)
router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.ANALYST),
  getAllProfiles
)

// 🧾 CSV export (both roles — required for Stage 3)
router.get(
  "/export/csv",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.ANALYST),
  (req, res) => {
    const profiles = [] // replace later with real data

    const csv = [
      ["id", "name", "email"],
      ...profiles.map(p => [p.id, p.name, p.email])
    ]
      .map(row => row.join(","))
      .join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=profiles.csv")

    res.send(csv)
  }
)

// 🗑 Example admin-only route
router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  (req, res) => {
    return res.json({ message: "Profile deleted (admin only)" })
  }
)

module.exports = router