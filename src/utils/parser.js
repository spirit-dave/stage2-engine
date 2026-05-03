module.exports = function parseQuery(q) {
  if (!q || typeof q !== "string") return null

  const query = q.toLowerCase().trim()

  const parsed = {}

  // =========================
  // ✅ GENDER (with synonyms)
  // =========================
  if (/(^|\s)(male|man|men|boy|boys)(\s|$)/.test(query)) {
    parsed.gender = "male"
  }

  if (/(^|\s)(female|woman|women|girl|girls)(\s|$)/.test(query)) {
    parsed.gender = "female"
  }

  // =========================
  // ✅ COUNTRY (expandable)
  // =========================
  const countryMap = {
    nigeria: "NG",
    kenya: "KE",
    ghana: "GH",
    uganda: "UG",
    tanzania: "TZ",
    rwanda: "RW",
    cameroon: "CM",
    egypt: "EG",
    morocco: "MA",
    southafrica: "ZA",
    "south africa": "ZA"
  }

  for (const key in countryMap) {
    if (query.includes(key)) {
      parsed.country_id = countryMap[key]
      break
    }
  }

  // =========================
  // ✅ AGE INTELLIGENCE
  // =========================

  if (query.includes("young")) {
    parsed.min_age = 13
    parsed.max_age = 25
  }

  if (query.includes("old") || query.includes("elderly")) {
    parsed.min_age = 50
  }

  if (query.includes("teen")) {
    parsed.age_group = "teenager"
  }

  if (query.includes("child") || query.includes("kid")) {
    parsed.age_group = "child"
  }

  if (query.includes("adult")) {
    parsed.age_group = "adult"
  }

  // =========================
  // ✅ PROBABILITY INTELLIGENCE
  // =========================

  // High confidence
  if (
    query.includes("high") ||
    query.includes("strong") ||
    query.includes("likely")
  ) {
    parsed.min_gender_probability = 0.75
    parsed.min_country_probability = 0.5
  }

  // Very high confidence
  if (
    query.includes("very high") ||
    query.includes("extreme")
  ) {
    parsed.min_gender_probability = 0.9
    parsed.min_country_probability = 0.7
  }

  // Low confidence
  if (query.includes("low")) {
    parsed.min_gender_probability = 0.3
  }

  // =========================
  // ✅ AGE RANGE (numbers in text)
  // =========================

  const ageRangeMatch = query.match(/(\d+)\s*-\s*(\d+)/)
  if (ageRangeMatch) {
    parsed.min_age = parseInt(ageRangeMatch[1])
    parsed.max_age = parseInt(ageRangeMatch[2])
  }

  // =========================
  // ✅ SINGLE AGE (e.g. "age 25")
  // =========================

  const singleAgeMatch = query.match(/age\s*(\d+)/)
  if (singleAgeMatch) {
    parsed.min_age = parseInt(singleAgeMatch[1])
    parsed.max_age = parseInt(singleAgeMatch[1])
  }

  // =========================
  // ✅ NAME SEARCH (bonus)
  // =========================

  // crude approach: extract capitalized words (optional upgrade later)
  const words = query.split(" ")
  const possibleNames = words.filter(
    w =>
      w.length > 2 &&
      ![
        "male","female","young","old","from","in","with","high","low",
        "teen","adult","child"
      ].includes(w)
  )

  if (possibleNames.length > 0) {
    parsed.name_contains = possibleNames.join(" ")
  }

  return parsed
}