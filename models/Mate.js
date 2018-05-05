const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const mateSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      minlength: 1
    },
    name: String,
    points: Number
  },
  { timestamps: true }
);

mateSchema.pre("save", async function save(next) {
  const mate = this;
  if (!mate.isModified("password")) {
    return next();
  }

  try {
    const hash = await bcrypt.hash(mate.password, 10);
    mate.password = hash;
    return next();
  } catch (err) {
    return next(err);
  }
});

mateSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const mate = mongoose.model("Mate", mateSchema);

module.exports = Mate;
