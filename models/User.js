const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minlength: 1,
    },
    name: String,
    points: Number,
  },
  { timestamps: true },
)

userSchema.pre("save", async function save(next) {
  console.log("Saving user")
  const user = this
  if (!user.isModified("password")) {
    return next()
  }

  try {
    const hash = await bcrypt.hash(user.password, 10)
    user.password = hash
    return next()
  } catch (err) {
    return next(err)
  }
})

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("user", userSchema)

module.exports = User
