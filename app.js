const process = require("process")
const crypto = require("crypto")
const path = require("path")
const express = require("express")
const favicon = require("serve-favicon")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const passport = require("passport")
const passportMiddleware = require("./config/passport")
const session = require("express-session")
const flash = require("connect-flash")
const compression = require("compression")
const ms = require("ms")
const mongoose = require("./config/db")
const MongoStore = require("connect-mongo")(session)

const app = express()

/**
 * Configuration
 */

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

// secret with default
const secret = process.env.SECRET || crypto.randomBytes(64).toString("hex")

/**
 * Plugins and middleware
 */

app.use(compression())
app.use(favicon(path.join(__dirname, "public", "favicon.ico")))
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"))
}
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash())
app.use(
  session({
    secret,
    name: "session",
    rolling: true,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
      maxAge: ms("48h"), // 48 hours
      httpOnly: false,
    },
  }),
)
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, "public")))

/**
 * Routes
 */

app.use("/", require("./routes/index"))
app.use("/auth", require("./routes/auth"))
app.use("/levels", passportMiddleware.ensureAuthenticated, require("./routes/levels"))
app.use("/admin", passportMiddleware.ensureAdmin, require("./routes/admin"))
app.use("/leaderboard", require("./routes/leaderboard"))

/**
 * Catch 404 and forward to error handler.
 */
app.use((req, res, next) => {
  const err = new Error("Not Found")
  err.status = 404
  return next(err)
})

/**
 * Error handler.
 */
// ESLint disabled because Express uses arity to check for error handlers
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app
