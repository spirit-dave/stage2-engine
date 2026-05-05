const parseQuery = require("../utils/parser")
const prisma = require("../utils/prisma")

// ==============================
// SAFE JSON SERIALIZER (FIX BIGINT)
// ==============================
function safeJson(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  )
}

// ==============================
// GET ALL PROFILES
// ==============================
exports.getAllProfiles = async (req, res) => {
  try {
    const {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by = "created_at",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query

    const validSort = ["age", "created_at", "gender_probability"]
    const validOrder = ["asc", "desc"]

    if (!validSort.includes(sort_by) || !validOrder.includes(order)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid query parameters"
      })
    }

    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 10, 50)

    const take = limitNum
    const skip = (pageNum - 1) * take

    const where = {}

    if (gender) where.gender = gender
    if (age_group) where.age_group = age_group
    if (country_id) where.country_id = country_id

    if (min_age || max_age) {
      where.age = {}
      if (min_age) where.age.gte = parseInt(min_age)
      if (max_age) where.age.lte = parseInt(max_age)
    }

    if (min_gender_probability) {
      where.gender_probability = {
        gte: parseFloat(min_gender_probability)
      }
    }

    if (min_country_probability) {
      where.country_probability = {
        gte: parseFloat(min_country_probability)
      }
    }

    const [data, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: {
          [sort_by]: order
        },
        skip,
        take
      }),
      prisma.profile.count({ where })
    ])

    return res.status(200).json(
      safeJson({
        status: "success",
        page: pageNum,
        limit: take,
        total,
        data
      })
    )

  } catch (error) {
    console.error("🔥 getAllProfiles error:", error)

    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}


// ==============================
// SEARCH PROFILES (NLP)
// ==============================
exports.searchProfiles = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query

    if (!q || q.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Missing search query"
      })
    }

    const parsed = parseQuery(q)

    if (!parsed) {
      return res.status(400).json({
        status: "error",
        message: "Unable to interpret query"
      })
    }

    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 10, 50)

    const take = limitNum
    const skip = (pageNum - 1) * take

    const where = {}

    if (parsed.gender) where.gender = parsed.gender
    if (parsed.age_group) where.age_group = parsed.age_group
    if (parsed.country_id) where.country_id = parsed.country_id

    if (parsed.min_age || parsed.max_age) {
      where.age = {}
      if (parsed.min_age) where.age.gte = parsed.min_age
      if (parsed.max_age) where.age.lte = parsed.max_age
    }

    const [data, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" }
      }),
      prisma.profile.count({ where })
    ])

    return res.status(200).json(
      safeJson({
        status: "success",
        page: pageNum,
        limit: take,
        total,
        data
      })
    )

  } catch (error) {
    console.error("🔥 searchProfiles error:", error)

    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}