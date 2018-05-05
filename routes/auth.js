const express = require("express")
const { checkSchema, validationResult } = require("express-validator/check")

const router = express.Router()
const passport = require("passport")

const User = require("../models/User")

function doLoginRedirect(req, res) {
  if (req.session.loginRedirect) {
    const redirectTo = `${req.session.loginRedirect}`
    delete req.session.loginRedirect
    res.redirect(redirectTo)
  } else {
    res.redirect("/")
  }
}

router.get("/logout", (req, res) => {
  req.logout()
  res.redirect("/")
})

router
  .route("/login")
  .get((req, res) => {
    res.render("auth/login", { messages: req.flash("error") })
  })
  .post(
    passport.authenticate("local", {
      failureRedirect: "back",
      failureFlash: true,
    }),
    doLoginRedirect,
  )

// useful for session debugging
router.get("/isLoggedIn", (req, res) => {
  res.json({ isLoggedIn: !!req.user })
})

router
  .route("/register")
  .get((req, res) => {
    res.render("auth/register", { messages: req.flash("error") })
  })
  .post(
    checkSchema({
      email: {
        isEmail: true,
        normalizeEmail: true,
        custom: {
          options: async email => {
            const user = await User.findOne({
              email,
            })
            if (user) {
              throw new Error("Email already in use")
            }
          },
        },
      },
      password: {
        isLength: {
          options: {
            min: 5,
          },
        },
      },
      name: {
        trim: true,
      },
    }),
    async (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const messages = errors.mapped()
        req.flash("error", messages)
        return res.redirect(422, "back")
      }

      let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      })

      try {
        user = await user.save()
        console.log("ho gaya save")
        req.login(user, () => {
          next()
        })
      } catch (err) {
        const message = "An unexpected error occurred."
        req.flash("error", message)
        res.redirect(400, "back")
      }
    },
    doLoginRedirect,
  )

module.exports = router
