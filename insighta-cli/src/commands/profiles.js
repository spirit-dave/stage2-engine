const axios = require("axios")
const { getConfig } = require("../utils/config")

async function getProfiles() {
  const config = getConfig()

  if (!config?.token) {
    console.log("You are not logged in. Run: insighta login")
    return
  }

  try {
    const res = await axios.get(
      "http://localhost:3000/api/v1/profiles",
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      }
    )

    console.log(res.data)
  } catch (err) {
    console.log("Error:", err.response?.data || err.message)
  }
}

module.exports = getProfiles