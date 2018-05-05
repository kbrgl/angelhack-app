const mongoose = require("mongoose")
const process = require("process")
const MongodbMemoryServer = require("mongodb-memory-server").default

function errorHandler(err) {
  console.error("connection error:", err.message)
  process.exit(1)
}

mongoose.Promise = Promise
const mongooseOptions = {
  useMongoClient: true,
}

/**
 * Connect to database.
 */

if (process.env.NODE_ENV === "test") {
  // if in test env, use in-memory server
  const mongod = new MongodbMemoryServer()
  mongod.getConnectionString().then(url => {
    mongoose.connect(url, mongooseOptions).catch(errorHandler)
  })
} else {
  mongoose.connect(process.env.MONGO_URL, mongooseOptions).catch(errorHandler)
}

module.exports = mongoose
