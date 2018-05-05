const express = require("express")
const passportMiddleware = require("../config/passport")
const Level = require("../models/Level")

const router = express.Router()

router
  .route("/")
  .get(async (req, res, next) => {
    // sanity check: ensure that user has a level
    if (!req.user.level) {
      try {
        await req.user.update({ level: 0 })
      } catch (err) {
        next(err)
      }
    }
    res.redirect(`/levels/${req.user.level}`)
  })
  .post(passportMiddleware.ensureAdmin, async (req, res, next) => {
    const level = new Level({
      number: req.body.number,
      text: req.body.text,
      answer: req.body.answer,
    })

    try {
      await level.save()
      res.redirect("../")
    } catch (err) {
      err.message = "Duplicate key, level already exists"
      next(err)
    }
  })

/**
 * Parses number in URLs of the form /(\d+) and
 * exposes it in req.levelNumber
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {function} next
 */
function levelNumberMiddleware(req, res, next) {
  let { number } = req.params
  number = parseInt(number, 10)
  req.levelNumber = number
  next()
}

router
  .route("/:number(\\d+)")
  .get(levelNumberMiddleware, async (req, res, next) => {
    if (req.user.level < req.levelNumber) {
      return res.status(403)
    }

    try {
      const level = await Level.findOne({ number: req.levelNumber })
      if (!level) {
        if (req.user.level === req.levelNumber) {
          /**
           * User has reached end of hunt, so render hunt completion message.
           * (Because user's level doesn't exist in database).
           */
          return res.render("levels/complete")
        }
        /**
         * User requested a level that doesn't exist, respond with 404.
         */
        return next()
      }
      return res.render("levels/level", { level })
    } catch (err) {
      return next(err)
    }
  })
  .post(levelNumberMiddleware, async (req, res, next) => {
    const providedAnswer = req.body.answer
    const level = await Level.findOne({ number: req.levelNumber })
    if (!level) {
      // Level doesn't exist, respond with 404
      return res.status(404).json({ message: `level ${req.levelNumber} not found` })
    }
    const isCorrect = level.checkAnswer(providedAnswer)
    if (req.user.level === level.number) {
      // handle db errors
      try {
        if (isCorrect) {
          // if the answer is correct, increment the user level
          // this will allow the user to access the next level
          await req.user.update({
            $inc: { level: 1 },
            $set: { lastSolveTimestamp: new Date() },
          })
        } else {
          await req.user.update({
            $inc: { attempts: 1 },
          })
        }
      } catch (err) {
        return next(err)
      }
    }
    // return JSON
    // redirecting to next level is the responsibility of the front-end
    return res.json({ isCorrect })
  })

module.exports = router
