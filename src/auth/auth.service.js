const { v4: uuidv4 } = require("uuid")
const ROLES = require("../utils/roles")

// Temporary storage (replace with DB later)
const users = [
  {
    id: uuidv4(),
    email: "admin@test.com",
    role: ROLES.ADMIN,
  },
  {
    id: uuidv4(),
    email: "analyst@test.com",
    role: ROLES.ANALYST,
  },
]

function findUserByEmail(email) {
  return users.find((u) => u.email === email)
}

module.exports = {
  findUserByEmail,
}