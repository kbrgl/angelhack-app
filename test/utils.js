const mongoose = require("../config/db")
const User = require("../models/User")
const _ = require("lodash")
const Chance = require("chance")

const chance = new Chance()

async function after() {
  await User.remove()
  await mongoose.disconnect()
}

async function before() {
  const user = new User({
    profile: {
      name: "User Name",
      country: "IN",
    },
    email: "user@example.com",
    password: "password",
  })
  const admin = new User({
    profile: {
      name: "Admin",
      country: "IN",
    },
    email: "admin@example.com",
    password: "password",
    isAdmin: true,
  })
  await user.save()
  await admin.save()
}

function sampleUserData(overrides, fields) {
  const sample = {
    email: chance.email(),
    password: chance.string(),
    profile: {
      country: chance.country(),
      name: chance.name(),
    },
  }
  const res = Object.assign({}, sample, overrides)
  if (fields) {
    return _.pick(res, fields)
  }
  return res
}

module.exports = {
  after,
  before,
  sampleUserData,
}
