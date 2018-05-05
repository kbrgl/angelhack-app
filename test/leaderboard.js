import test from "ava"
import request from "supertest"
import app from "../app"
import { after, before } from "./utils"

test.before(before)
test.after.always(after)

test.serial("test leaderboard", async t => {
  const res = await request(app).get("/leaderboard")
  t.truthy(res.text.includes("User Name"))
})
