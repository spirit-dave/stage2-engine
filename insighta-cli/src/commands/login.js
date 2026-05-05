const axios = require("axios")
const inquirer = require("inquirer")
const { saveConfig } = require("../utils/config")

async function login() {
  const answers = await inquirer.prompt([
    {
      name: "email",
      message: "Enter email:",
    },
  ])

  try {
    const res = await axios.post(
      "http://localhost:3000/api/v1/auth/login",
      {
        email: answers.email,
      }
    )

    const { accessToken, user } = res.data

    saveConfig({
      token: accessToken,
      user,
    })

    console.log("Login successful ✔")
  } catch (err) {
    console.log("Login failed ❌", err.response?.data || err.message)
  }
}

module.exports = login