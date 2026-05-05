// controllers/upload.controller.js
const fs = require("fs")
const csv = require("csv-parser")
const prisma = require("../utils/prisma")

exports.uploadCSV = async (req, res) => {
  const results = []

  let inserted = 0
  let skipped = 0

  const reasons = {
    duplicate_name: 0,
    invalid_age: 0,
    missing_fields: 0,
  }

  const BATCH_SIZE = 1000
  let batch = []

  const stream = fs.createReadStream(req.file.path).pipe(csv())

  for await (const row of stream) {
    // validation
    if (!row.name || !row.age) {
      skipped++
      reasons.missing_fields++
      continue
    }

    if (Number(row.age) < 0) {
      skipped++
      reasons.invalid_age++
      continue
    }

    batch.push({
      name: row.name,
      age: Number(row.age),
      gender: row.gender,
      country_id: row.country_id,
    })

    if (batch.length === BATCH_SIZE) {
      await prisma.profile.createMany({
        data: batch,
        skipDuplicates: true,
      })
      inserted += batch.length
      batch = []
    }
  }

  // insert remaining
  if (batch.length > 0) {
    await prisma.profile.createMany({
      data: batch,
      skipDuplicates: true,
    })
    inserted += batch.length
  }

  return res.json({
    status: "success",
    total_rows: inserted + skipped,
    inserted,
    skipped,
    reasons,
  })
}