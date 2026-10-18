import "./setup.js";
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { connect, disconnect, clear } from "./helpers.js";

before(connect);
after(disconnect);
beforeEach(clear);

const register = (payload) =>
  request(app).post("/api/auth/register").send(payload);

test("registers a new customer and returns a token", async () => {
  const res = await register({
    name: "Jane",
    email: "jane@example.com",
    password: "secret123",
  });

  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, "customer");
  assert.equal(res.body.user.email, "jane@example.com");
});

test("rejects an invalid registration payload", async () => {
  const res = await register({
    name: "X",
    email: "not-an-email",
    password: "123",
  });

  assert.equal(res.status, 400);
  assert.ok(res.body.errors.length >= 1);
});

test("rejects a duplicate email", async () => {
  await register({
    name: "Jane",
    email: "dup@example.com",
    password: "secret123",
  });
  const res = await register({
    name: "Jane",
    email: "dup@example.com",
    password: "secret123",
  });

  assert.equal(res.status, 409);
});

test("logs in with valid credentials", async () => {
  await register({
    name: "Jane",
    email: "login@example.com",
    password: "secret123",
  });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "login@example.com", password: "secret123" });

  assert.equal(res.status, 200);
  assert.ok(res.body.token);
});

test("rejects a wrong password", async () => {
  await register({
    name: "Jane",
    email: "wrong@example.com",
    password: "secret123",
  });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "wrong@example.com", password: "nope" });

  assert.equal(res.status, 401);
});

test("protects the current-user endpoint", async () => {
  const res = await request(app).get("/api/auth/me");
  assert.equal(res.status, 401);
});
