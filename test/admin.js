import test from "ava"
import request from "supertest"
import app from "../app"
import { after, before } from "./utils"

test.before(before)
test.after.always(after)

test.serial("test admin forbidden", async t => {
  const agent = request.agent(app)
  await agent.post("/auth/login").send({
    email: "user@example.com",
    password: "password",
  })
  const res = await agent.get("/admin")
  t.is(res.status, 403)
})

test.serial("test admin accessable", async t => {
  const agent = request.agent(app)
  await agent.post("/auth/login").send({
    email: "admin@example.com",
    password: "password",
  })
  const res = await agent.get("/admin")
  t.is(res.status, 200)
})
