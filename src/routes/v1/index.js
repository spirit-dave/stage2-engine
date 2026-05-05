const express = require("express")
const router = express.Router()

router.use("/profiles", require("../profiles"))

module.exports = router