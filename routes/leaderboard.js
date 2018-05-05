const express = require("express")
const { countries } = require("country-data")

const router = express.Router()
const User = require("../models/User")

router.get("/", async (req, res) => {
  const users = await User.find().sort("-date")
  res.render("leaderboard", {
    users: users.map(user => {
      const country = countries[user.profile.country] || {
        name: "Earth",
        emoji: "🌎",
      }
      return {
        ...user,
        profile: {
          ...user.profile,
          country: `${country.emoji} ${country.name}`,
        },
      }
    }),
  })
})
module.exports = router
