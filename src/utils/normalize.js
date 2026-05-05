// src/utils/normalize.js
function normalizeQuery(query) {
  const normalized = {}

  if (query.gender) {
    normalized.gender = query.gender.toLowerCase()
  }

  if (query.country_id) {
    normalized.country_id = query.country_id.toUpperCase()
  }

  if (query.age_group) {
    normalized.age_group = query.age_group.toLowerCase()
  }

  if (query.min_age || query.max_age) {
    normalized.age = {
      gte: query.min_age ? Number(query.min_age) : undefined,
      lte: query.max_age ? Number(query.max_age) : undefined,
    }
  }

  return normalized
}

module.exports = normalizeQuery