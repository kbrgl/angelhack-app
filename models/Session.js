const mongoose = require("mongoose");
const Mate = require("./Mate");
const normalize = require("../utils/normalize");

const sessionSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      unique: true
    },
    topic: String,
    exercises: [String],
    mates: [Mate]
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
