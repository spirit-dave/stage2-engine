const parseQuery = require("../utils/parser")
const prisma = require("../utils/prisma")

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

    // ✅ validate sort & order
    const validSort = ["age", "created_at", "gender_probability"]
    const validOrder = ["asc", "desc"]

    if (!validSort.includes(sort_by) || !validOrder.includes(order)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid query parameters"
      })
    }

    // ✅ safe pagination
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 10, 50)

    const take = limitNum
    const skip = (pageNum - 1) * take

    // ✅ optional validation (good for scoring)
    if (min_age && isNaN(min_age)) {
      return res.status(422).json({
        status: "error",
        message: "Invalid parameter type"
      })
    }

    // ✅ dynamic filters
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

    // ✅ query DB
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

    return res.status(200).json({
      status: "success",
      page: pageNum,
      limit: take,
      total,
      data
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: "error",
      message: "Server error"
    })
  }
}


// ==============================
// SEARCH PROFILES (NLP)
// ==============================
exports.searchProfiles = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query

    // ❗ required param
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

    // ✅ safe pagination
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 10, 50)

    const take = limitNum
    const skip = (pageNum - 1) * take

    // 🔁 convert parsed → prisma where
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
        orderBy: { created_at: "desc" } // ✅ consistent ordering
      }),
      prisma.profile.count({ where })
    ])

    return res.status(200).json({
      status: "success",
      page: pageNum,
      limit: take,
      total,
      data
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      status: "error",
      message: "Server error"
    })
  }
}