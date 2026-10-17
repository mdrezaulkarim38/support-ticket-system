import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Ticket from "./models/Ticket.js";
import Comment from "./models/Comment.js";

const DEMO_PASSWORD = "123456";

const tickets = [
  {
    title: "Cannot log in to my account",
    description:
      "I forgot my password and the reset email never arrives. I am locked out of my account.",
    category: "Account",
    priority: "High",
    status: "Open",
  },
  {
    title: "Charged twice this month",
    description:
      "My card was charged two times for the same monthly subscription. I want a refund.",
    category: "Billing",
    priority: "Medium",
    status: "In Progress",
  },
  {
    title: "App crashes on startup",
    description:
      "The mobile app closes immediately after the splash screen on Android 15.",
    category: "Technical",
    priority: "Urgent",
    status: "Resolved",
  },
];

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Ticket.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  const customer = await User.create({
    name: "Demo Customer",
    email: "customer@example.com",
    password: DEMO_PASSWORD,
    role: "customer",
  });

  const agent = await User.create({
    name: "Demo Agent",
    email: "agent@example.com",
    password: DEMO_PASSWORD,
    role: "agent",
  });

  const created = [];
  for (const t of tickets) {
    created.push(
      await Ticket.create({
        ...t,
        aiSuggestedCategory: t.category,
        aiSuggestedPriority: t.priority,
        createdBy: customer._id,
        assignedTo: agent._id,
      })
    );
  }

  await Comment.create([
    {
      ticket: created[1]._id,
      user: agent._id,
      message: "Thanks for reporting - I have escalated this to our billing team.",
    },
    {
      ticket: created[1]._id,
      user: customer._id,
      message: "Any update on the refund?",
    },
  ]);

  console.log("Seed complete");
  console.log(`  ${created.length} tickets created`);
  console.log("  customer@example.com / 123456");
  console.log("  agent@example.com / 123456");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
