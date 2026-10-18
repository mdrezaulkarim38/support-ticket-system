import "./setup.js";
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { connect, disconnect, clear, createUser, tokenFor } from "./helpers.js";

before(connect);
after(disconnect);
beforeEach(clear);

const setup = async () => {
  const customer = await createUser({
    name: "Cust",
    email: "c@test.com",
    password: "secret123",
    role: "customer",
  });
  const agent = await createUser({
    name: "Agent",
    email: "a@test.com",
    password: "secret123",
    role: "agent",
  });

  const created = await request(app)
    .post("/api/tickets")
    .set("Authorization", `Bearer ${tokenFor(customer)}`)
    .send({ title: "Need help", description: "details" });

  return {
    id: created.body._id,
    customerToken: tokenFor(customer),
    agentToken: tokenFor(agent),
  };
};

test("adds and lists comments on a ticket", async () => {
  const { id, customerToken, agentToken } = await setup();

  const agentComment = await request(app)
    .post(`/api/tickets/${id}/comments`)
    .set("Authorization", `Bearer ${agentToken}`)
    .send({ message: "Looking into it." });
  assert.equal(agentComment.status, 201);

  const customerComment = await request(app)
    .post(`/api/tickets/${id}/comments`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({ message: "Thanks!" });
  assert.equal(customerComment.status, 201);

  const list = await request(app)
    .get(`/api/tickets/${id}/comments`)
    .set("Authorization", `Bearer ${customerToken}`);
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 2);
});

test("rejects an empty comment", async () => {
  const { id, customerToken } = await setup();

  const res = await request(app)
    .post(`/api/tickets/${id}/comments`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({ message: "   " });

  assert.equal(res.status, 400);
});
