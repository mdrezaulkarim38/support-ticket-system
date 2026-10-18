import "./setup.js";
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { connect, disconnect, clear, createUser, tokenFor } from "./helpers.js";

before(connect);
after(disconnect);
beforeEach(clear);

const setupUsers = async () => {
  const admin = await createUser({
    name: "Admin",
    email: "admin@test.com",
    password: "secret123",
    role: "admin",
  });
  const agent = await createUser({
    name: "Agent",
    email: "agent@test.com",
    password: "secret123",
    role: "agent",
  });
  const customer = await createUser({
    name: "Cust",
    email: "customer@test.com",
    password: "secret123",
    role: "customer",
  });

  return {
    adminToken: tokenFor(admin),
    agentToken: tokenFor(agent),
    customerToken: tokenFor(customer),
  };
};

const createAgent = (token, body) =>
  request(app)
    .post("/api/users/agents")
    .set("Authorization", `Bearer ${token}`)
    .send(body);

test("an admin can create an agent account", async () => {
  const { adminToken } = await setupUsers();

  const res = await createAgent(adminToken, {
    name: "New Agent",
    email: "new@test.com",
    password: "secret123",
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.role, "agent");
  assert.equal(res.body.email, "new@test.com");
});

test("non-admins cannot create agents", async () => {
  const { agentToken, customerToken } = await setupUsers();
  const payload = {
    name: "Nope",
    email: "nope@test.com",
    password: "secret123",
  };

  assert.equal((await createAgent(agentToken, payload)).status, 403);
  assert.equal((await createAgent(customerToken, payload)).status, 403);
});

test("creating an agent with a duplicate email is rejected", async () => {
  const { adminToken } = await setupUsers();

  const res = await createAgent(adminToken, {
    name: "Copy",
    email: "agent@test.com",
    password: "secret123",
  });

  assert.equal(res.status, 409);
});

test("creating an agent with an invalid payload is rejected", async () => {
  const { adminToken } = await setupUsers();

  const res = await createAgent(adminToken, {
    name: "",
    email: "bad",
    password: "1",
  });

  assert.equal(res.status, 400);
});

test("admins and agents can list agents, customers cannot", async () => {
  const { adminToken, agentToken, customerToken } = await setupUsers();

  assert.equal(
    (
      await request(app)
        .get("/api/users/agents")
        .set("Authorization", `Bearer ${adminToken}`)
    ).status,
    200
  );
  assert.equal(
    (
      await request(app)
        .get("/api/users/agents")
        .set("Authorization", `Bearer ${agentToken}`)
    ).status,
    200
  );
  assert.equal(
    (
      await request(app)
        .get("/api/users/agents")
        .set("Authorization", `Bearer ${customerToken}`)
    ).status,
    403
  );
});
