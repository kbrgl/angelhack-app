const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/Mate");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: `Email ${email} not found.` });
      }

      return user
        .comparePassword(password)
        .then(isMatch => {
          if (isMatch) {
            return done(null, user);
          }
          return done(null, false, { message: "Invalid email or password." });
        })
        .catch(err_ => done(err_));
    });
  })
);

function ensureAuthenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.session.loginRedirect = req.originalUrl;
    res.redirect("/auth/login");
  }
}
function ensureAdmin(req, res, next) {
  ensureAuthenticated(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.sendStatus(403);
    }
  });
}

module.exports = { ensureAdmin, ensureAuthenticated };
