import "./setup.js";
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { connect, disconnect, clear, createUser, tokenFor } from "./helpers.js";

before(connect);
after(disconnect);
beforeEach(clear);

const CATEGORIES = ["Technical", "Billing", "Account", "Feature Request", "General"];

const setupUsers = async () => {
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
  const admin = await createUser({
    name: "Admin",
    email: "admin@test.com",
    password: "secret123",
    role: "admin",
  });

  return {
    customer,
    agent,
    admin,
    customerToken: tokenFor(customer),
    agentToken: tokenFor(agent),
    adminToken: tokenFor(admin),
  };
};

const createTicket = (token, body) =>
  request(app)
    .post("/api/tickets")
    .set("Authorization", `Bearer ${token}`)
    .send(body);

test("customer creates a ticket classified by the AI fallback", async () => {
  const { customerToken } = await setupUsers();

  const res = await createTicket(customerToken, {
    title: "Cannot log in",
    description: "Login fails every time.",
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.status, "Open");
  assert.ok(CATEGORIES.includes(res.body.category));
  assert.ok(res.body.priority);
});

test("agents cannot create tickets", async () => {
  const { agentToken } = await setupUsers();
  const res = await createTicket(agentToken, { title: "x", description: "y" });
  assert.equal(res.status, 403);
});

test("rejects a ticket without a title", async () => {
  const { customerToken } = await setupUsers();
  const res = await createTicket(customerToken, { description: "no title" });
  assert.equal(res.status, 400);
});

test("agent assigns then unassigns a ticket and activity is recorded", async () => {
  const { customerToken, agentToken } = await setupUsers();
  const created = await createTicket(customerToken, {
    title: "Assign me",
    description: "desc",
  });
  const id = created.body._id;

  const assigned = await request(app)
    .patch(`/api/tickets/${id}/assign`)
    .set("Authorization", `Bearer ${agentToken}`)
    .send({});
  assert.equal(assigned.status, 200);
  assert.ok(assigned.body.assignedTo);

  const unassigned = await request(app)
    .patch(`/api/tickets/${id}/assign`)
    .set("Authorization", `Bearer ${agentToken}`)
    .send({ assignedTo: null });
  assert.equal(unassigned.status, 200);
  assert.equal(unassigned.body.assignedTo, null);

  const activity = await request(app)
    .get(`/api/tickets/${id}/activity`)
    .set("Authorization", `Bearer ${customerToken}`);
  const actions = activity.body.map((entry) => entry.action);
  assert.ok(actions.includes("created"));
  assert.ok(actions.includes("assigned"));
  assert.ok(actions.includes("unassigned"));
});

test("customers cannot assign tickets", async () => {
  const { customerToken } = await setupUsers();
  const created = await createTicket(customerToken, {
    title: "t",
    description: "d",
  });

  const res = await request(app)
    .patch(`/api/tickets/${created.body._id}/assign`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({});

  assert.equal(res.status, 403);
});

test("status transitions are validated", async () => {
  const { customerToken, adminToken } = await setupUsers();
  const created = await createTicket(customerToken, {
    title: "t",
    description: "d",
  });
  const id = created.body._id;

  const invalid = await request(app)
    .patch(`/api/tickets/${id}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "Resolved" });
  assert.equal(invalid.status, 400);

  const valid = await request(app)
    .patch(`/api/tickets/${id}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "In Progress" });
  assert.equal(valid.status, 200);
  assert.equal(valid.body.status, "In Progress");
});

test("agents only see and update tickets assigned to them", async () => {
  const { customerToken, agentToken, agent, adminToken } = await setupUsers();

  const assigned = await createTicket(customerToken, {
    title: "assigned",
    description: "d",
  });
  await request(app)
    .patch(`/api/tickets/${assigned.body._id}/assign`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ assignedTo: agent._id.toString() });

  await createTicket(customerToken, { title: "unassigned", description: "d" });

  const agentList = await request(app)
    .get("/api/tickets")
    .set("Authorization", `Bearer ${agentToken}`);
  assert.equal(agentList.body.total, 1);
  assert.equal(agentList.body.items[0].title, "assigned");

  const adminList = await request(app)
    .get("/api/tickets")
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(adminList.body.total, 2);

  const allowed = await request(app)
    .patch(`/api/tickets/${assigned.body._id}/status`)
    .set("Authorization", `Bearer ${agentToken}`)
    .send({ status: "In Progress" });
  assert.equal(allowed.status, 200);
});

test("ticket list supports pagination and search", async () => {
  const { customerToken } = await setupUsers();

  for (const title of ["alpha bug", "beta bug", "gamma issue"]) {
    await createTicket(customerToken, { title, description: "details" });
  }

  const page = await request(app)
    .get("/api/tickets?page=1&limit=2")
    .set("Authorization", `Bearer ${customerToken}`);
  assert.equal(page.status, 200);
  assert.equal(page.body.items.length, 2);
  assert.equal(page.body.total, 3);
  assert.equal(page.body.pages, 2);

  const search = await request(app)
    .get("/api/tickets?q=bug")
    .set("Authorization", `Bearer ${customerToken}`);
  assert.equal(search.body.total, 2);
});

test("customers only see their own tickets", async () => {
  const { customerToken } = await setupUsers();
  const other = await createUser({
    name: "Other",
    email: "other@test.com",
    password: "secret123",
    role: "customer",
  });

  await createTicket(customerToken, { title: "mine", description: "d" });
  const otherToken = tokenFor(other);

  const res = await request(app)
    .get("/api/tickets")
    .set("Authorization", `Bearer ${otherToken}`);
  assert.equal(res.body.total, 0);
});

test("stats endpoint returns aggregates", async () => {
  const { customerToken, adminToken } = await setupUsers();
  await createTicket(customerToken, { title: "one", description: "d" });

  const res = await request(app)
    .get("/api/tickets/stats")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.total, 1);
  assert.ok(res.body.byStatus);
  assert.ok(Array.isArray(res.body.trend));
  assert.equal(res.body.trend.length, 7);
});
