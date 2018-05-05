import test from "ava"
import request from "supertest"
import _ from "lodash"
import app from "../app"
import { after, before, sampleUserData } from "./utils"

test.before(before)
test.after.always(after)

test.serial("test login with nonexistent email", async t => {
  const res = await request(app)
    .post("/auth/login")
    .send(sampleUserData({}, ["email", "password"]))
  t.is(res.header.location, "/auth/login")
})

test.serial("test login", async t => {
  const res = await request(app)
    .post("/auth/login")
    .send({
      email: "user@example.com",
      password: "password",
    })
  t.is(res.header.location, "/")
})

test.serial("test login session", async t => {
  const agent = request.agent(app)
  await agent.post("/auth/login").send({
    email: "user@example.com",
    password: "password",
  })
  const res = await agent.get("/auth/isLoggedIn")
  t.truthy(res.body.isLoggedIn)
})

test.serial("test register with insecure password", async t => {
  const res = await request(app)
    .post("/auth/register")
    .send(
      sampleUserData({
        password: "123",
      }),
    )
  t.is(res.status, 422)
})

test.serial("test register without fields", async t => {
  const userData = sampleUserData()
  const requests = []
  Object.keys(userData).forEach(key => {
    requests.push(
      request(app)
        .post("/auth/register")
        .send(_.omit(userData, key)),
    )
  })
  const results = await Promise.all(requests)
  results.forEach(res => {
    t.is(res.status, 422)
  })
})

test.serial("test register", async t => {
  const agent = request.agent(app)
  const userData = sampleUserData()
  let res = await agent
    .post("/auth/register")
    .redirects(1)
    .send(userData)
  t.is(res.status, 200)
  res = await agent.get("/auth/isLoggedIn")
  t.is(res.body.isLoggedIn, true)
})
