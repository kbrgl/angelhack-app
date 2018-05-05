const mongoose = require("mongoose")

function padZeroes(total, s) {
  const str = String(s)
  if (total < s.length) return null
  return "0".repeat(total - str.length) + str
}

function randCode() {
  return padZeroes(4, Math.floor(Math.random() * 9999 + 1))
}

const sessionSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      unique: true,
    },
    topic: String,
    exercises: [String],
  },
  { timestamps: true },
)

sessionSchema.pre("save", async function save(next) {
  if (!this.isNew()) {
    return next()
  }
  this.code = randCode()
  return next()
})

const Session = mongoose.model("Session", sessionSchema)

module.exports = Session
