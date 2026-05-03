console.log("🚀 Seed script started")

const fs = require("fs")
const path = require("path")
const prisma = require("../utils/prisma")
const { v4: uuidv4 } = require("uuid")

async function seed() {
  try {
    console.log("📂 Loading JSON file...")

    const filePath = path.join(__dirname, "../../seed_profiles.json")
    console.log("📍 File path:", filePath)

    const rawData = fs.readFileSync(filePath, "utf-8")
    console.log("✅ File read successfully")

    const parsed = JSON.parse(rawData)

    // ✅ CORRECT for your file
    const profiles = parsed.profiles

    if (!Array.isArray(profiles) || profiles.length === 0) {
      throw new Error("Seed file is empty or invalid format")
    }

    console.log(`📊 Total profiles found: ${profiles.length}`)
    console.log("🌱 Starting database seeding...")

    let count = 0

    for (const p of profiles) {
      await prisma.profile.upsert({
        where: { name: p.name },
        update: {},
        create: {
          id: uuidv4(),
          name: p.name,
          gender: p.gender,
          gender_probability: p.gender_probability,
          age: p.age,
          age_group: p.age_group,
          country_id: p.country_id,
          country_name: p.country_name,
          country_probability: p.country_probability
        }
      })

      count++

      if (count % 100 === 0) {
        console.log(`⏳ Seeded ${count}/${profiles.length}`)
      }
    }

    console.log("🎉 Seeding completed successfully!")

  } catch (err) {
    console.error("❌ Seeding failed:", err.message)
  } finally {
    await prisma.$disconnect()
  }
}

seed()